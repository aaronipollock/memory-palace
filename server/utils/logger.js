const pino = require('pino');

const isProduction = process.env.NODE_ENV === 'production';

// Keys (and nested paths) to redact in logs. Pino redacts in emitted JSON; redactForMemory() redacts in-memory buffer.
const SENSITIVE_KEYS = [
  'password', 'token', 'authorization', 'cookie', 'secret', 'apiKey', 'api_key',
  'refreshToken', 'accessToken', 'jwt', 'bearer', 'credentials', 'sessionId', 'session_id'
];
const REDACTED = '[Redacted]';

// In fast-redact, * matches one path segment. So *.token = one level (e.g. body.token), not user.session.token.
// Add paths for 1, 2, and 3 levels so we catch nested structures like user.session.token.
function redactPathsForDepth(key, maxDepth = 3) {
  const paths = [];
  let prefix = '';
  for (let d = 0; d < maxDepth; d++) {
    prefix = d === 0 ? '*' : `${prefix}.*`;
    paths.push(`${prefix}.${key}`);
  }
  return paths;
}

const pinoRedactPaths = [
  ...SENSITIVE_KEYS,
  ...SENSITIVE_KEYS.flatMap(k => redactPathsForDepth(k)),
  'req.headers.authorization', 'req.headers.cookie', 'headers.authorization', 'headers.cookie'
];

const loggerEngine = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  redact: {
    paths: pinoRedactPaths,
    censor: REDACTED
  }
});

function redactForMemory(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redactForMemory);
  const out = {};
  const lower = (s) => String(s).toLowerCase();
  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_KEYS.some(sk => lower(key) === lower(sk));
    out[key] = isSensitive ? REDACTED : redactForMemory(value);
  }
  return out;
}

/** True if value looks like an Error (has message; optional name/stack). */
function isErrorLike(value) {
  return value && typeof value === 'object' && typeof value.message === 'string';
}

/**
 * Turn an Error into a plain object for logging. Safe for JSON and Pino.
 * - name, message, code (if set). Stack only when includeStack is true (default: development).
 * - cause chain serialized recursively.
 */
function serializeError(err, opts = {}) {
  if (!isErrorLike(err)) return err;
  const includeStack = opts.includeStack ?? process.env.NODE_ENV !== 'production';
  const out = {
    name: err.name || 'Error',
    message: err.message,
    code: err.code
  };
  if (includeStack && err.stack) out.stack = err.stack;
  if (err.cause !== undefined) out.cause = serializeError(err.cause, opts);
  return out;
}

/** Deep-clone fields and replace any Error (or error-like) value with serializeError(result). */
function normalizeFieldsForLog(fields) {
  if (fields === null || typeof fields !== 'object') return fields;
  if (Array.isArray(fields)) return fields.map(normalizeFieldsForLog);
  if (isErrorLike(fields)) return serializeError(fields);
  const out = {};
  for (const [key, value] of Object.entries(fields)) {
    out[key] = isErrorLike(value) ? serializeError(value) : normalizeFieldsForLog(value);
  }
  return out;
}

class Logger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs in memory
  }

  // In-memory shape is { level, msg, ...fields } for getLogs/getStats; Pino output has its own format (time, numeric level, etc.).
  // Redact sensitive fields before storing so getLogs/exportLogs never expose secrets.
  formatMessage(level, msg, fields) {
    return redactForMemory({ level, msg, ...fields });
  }

  // Add log to memory
  addToLogs(logEntry) {
    this.logs.push(logEntry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  // Internal: normalize, in-memory, Pino emit, and optional sendToExternalService for errors.
  // extraForMemory: merged into in-memory entry only (e.g. requestId when using Pino child so child bindings are sole source in output).
  _log(level, msg, fields, pinoTarget = loggerEngine, extraForMemory = null) {
    const safeFields = normalizeFieldsForLog(fields);
    const memoryFields = extraForMemory ? { ...safeFields, ...extraForMemory } : safeFields;
    const logEntry = this.formatMessage(level, msg, memoryFields);
    this.addToLogs(logEntry);

    pinoTarget[level](safeFields, msg);

    if (level === 'error' && this.isProduction) {
      this.sendToExternalService(logEntry);
    }
  }

  // Error logging. Error objects in fields are serialized (name, message, code, stack in dev).
  error(msg, fields = {}) {
    this._log('error', msg, fields, loggerEngine);
  }

  warn(msg, fields = {}) {
    this._log('warn', msg, fields, loggerEngine);
  }

  info(msg, fields = {}) {
    this._log('info', msg, fields, loggerEngine);
  }

  debug(msg, fields = {}) {
    this._log('debug', msg, fields, loggerEngine);
  }

  // Security logging: one fields object in, fixed message, event in fields (same pattern as apiRequest)
  security(fields = {}) {
    const { event, ...rest } = fields;

    const logFields = normalizeFieldsForLog({
      event,
      ...rest,
      eventType: 'security_event'
    });

    const memoryEntry = this.formatMessage('warn', 'Security event detected', logFields);
    this.addToLogs(memoryEntry);

    loggerEngine.warn(logFields, 'Security event detected');

    if (this.isProduction) {
      this.sendToExternalService(memoryEntry);
    }
  }

  // Performance logging: one fields object in, fixed message (same pattern as apiRequest)
  performance(fields = {}) {
    const { metric, value, ...rest } = fields;

    const logFields = normalizeFieldsForLog({
      metric,
      value,
      ...rest,
      eventType: 'performance'
    });

    const memoryEntry = this.formatMessage('info', 'Performance metric recorded', logFields);
    this.addToLogs(memoryEntry);

    loggerEngine.info(logFields, 'Performance metric recorded');
  }

  // API request logging: one fields object in, fixed message, severity from statusCode
  apiRequest(fields = {}) {
    const {
      requestId,
      route,
      method,
      statusCode,
      duration,
      userId
    } = fields;

    // Normalize statusCode so severity and logged value match (missing/invalid => 500)
    const status = typeof statusCode === 'number' && statusCode >= 0 ? statusCode : 500;

    const logFields = {
      requestId,
      route,
      method,
      statusCode: status,
      duration,
      userId,
      eventType: 'api_request'
    };

    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

    const memoryEntry = this.formatMessage(level, 'HTTP request completed', logFields);
    this.addToLogs(memoryEntry);

    loggerEngine[level](logFields, 'HTTP request completed');
  }



  // Database logging: one fields object in, fixed message (same pattern as apiRequest)
  database(fields = {}) {
    const {
      operation,
      collection,
      duration,
      requestId,
      ...rest
    } = fields;

    const logFields = normalizeFieldsForLog({
      operation,
      collection,
      duration,
      requestId,
      ...rest,
      eventType: 'database_query'
    });

    const memoryEntry = this.formatMessage('info', 'Database query completed', logFields);
    this.addToLogs(memoryEntry);

    loggerEngine.info(logFields, 'Database query completed');
  }

  // No-op until you plug in a transport (e.g. pino.transport to file/Datadog). Keeps production output Pino-only.
  sendToExternalService(logEntry) {
    void logEntry;
  }

  // Get logs for debugging
  getLogs(level = null, limit = 100) {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }

    return filteredLogs.slice(-limit);
  }

  // Export logs
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Get log statistics
  getStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {},
      byHour: {},
      errors: this.logs.filter(log => log.level === 'error').length,
      warnings: this.logs.filter(log => log.level === 'warn').length
    };

    // Count by level
    this.logs.forEach(log => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
    });

    return stats;
  }

  /**
   * Returns a request-scoped logger backed by a real Pino child (bindings: requestId).
   * requestId is only in the child's bindings (not merged into payload) to avoid duplicate in output.
   * userId is merged at call time. extraForMemory adds requestId to in-memory buffer only.
   */
  requestLogger(req) {
    const pinoChild = loggerEngine.child({ requestId: req.id });
    const extraForMemory = { requestId: req.id };

    const payloadBindings = () => ({
      userId: req.user?.id ?? req.user?._id ?? null
    });

    return {
      error: (msg, fields = {}) => this._log('error', msg, { ...payloadBindings(), ...fields }, pinoChild, extraForMemory),
      warn: (msg, fields = {}) => this._log('warn', msg, { ...payloadBindings(), ...fields }, pinoChild, extraForMemory),
      info: (msg, fields = {}) => this._log('info', msg, { ...payloadBindings(), ...fields }, pinoChild, extraForMemory),
      debug: (msg, fields = {}) => this._log('debug', msg, { ...payloadBindings(), ...fields }, pinoChild, extraForMemory)
    };
  }
}

// Global logger instance
const logger = new Logger();

// Convenience functions
const logError = (msg, fields) => logger.error(msg, fields);
const logWarn = (msg, fields) => logger.warn(msg, fields);
const logInfo = (msg, fields) => logger.info(msg, fields);
const logDebug = (msg, fields) => logger.debug(msg, fields);
const logSecurity = (fields) => logger.security(fields);
const logPerformance = (fields) => logger.performance(fields);
const logApiRequest = (fields) => logger.apiRequest(fields);
const logDatabase = (fields) => logger.database(fields);

// Export the logger instance and convenience functions
module.exports = {
  logger,
  logError,
  logWarn,
  logInfo,
  logDebug,
  logSecurity,
  logPerformance,
  logApiRequest,
  logDatabase,
  serializeError
};
