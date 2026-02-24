// Server-side logging utility for MVP
// Can be extended with external logging services like Winston, Bunyan, etc.

class Logger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs in memory
  }

  // Log levels
  static LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  };

  // Check if should log based on level
  shouldLog(level) {
    return Logger.LEVELS[level] <= Logger.LEVELS[this.logLevel.toUpperCase()];
  }

  // Format log message
  formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      environment: process.env.NODE_ENV || 'development'
    };

    // Add request ID at top level for easy correlation
    if (data.requestId) {
      logEntry.requestId = data.requestId;
    }

    return logEntry;
  }

  // Add log to memory
  addToLogs(logEntry) {
    this.logs.push(logEntry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  // Error logging
  error(message, data = {}) {
    if (!this.shouldLog('ERROR')) return;

    const logEntry = this.formatMessage('ERROR', message, data);
    this.addToLogs(logEntry);

    // Console output
    console.error(`❌ [ERROR] ${message}`, data);

    // Send to external service in production
    if (this.isProduction) {
      this.sendToExternalService(logEntry);
    }
  }

  // Warning logging
  warn(message, data = {}) {
    if (!this.shouldLog('WARN')) return;

    const logEntry = this.formatMessage('WARN', message, data);
    this.addToLogs(logEntry);

    console.warn(`⚠️ [WARN] ${message}`, data);
  }

  // Info logging
  info(message, data = {}) {
    if (!this.shouldLog('INFO')) return;

    const logEntry = this.formatMessage('INFO', message, data);
    this.addToLogs(logEntry);

    console.info(`ℹ️ [INFO] ${message}`, data);
  }

  // Debug logging
  debug(message, data = {}) {
    if (!this.shouldLog('DEBUG')) return;

    const logEntry = this.formatMessage('DEBUG', message, data);
    this.addToLogs(logEntry);

    console.debug(`🔍 [DEBUG] ${message}`, data);
  }

  // Security logging
  security(event, data = {}) {
    const logEntry = this.formatMessage('SECURITY', event, {
      ...data,
      securityEvent: true
    });
    this.addToLogs(logEntry);

    console.warn(`🔒 [SECURITY] ${event}`, data);

    // Always send security events to external service
    if (this.isProduction) {
      this.sendToExternalService(logEntry);
    }
  }

  // Performance logging
  performance(metric, value, data = {}) {
    const logEntry = this.formatMessage('PERFORMANCE', metric, {
      value,
      ...data
    });
    this.addToLogs(logEntry);

    console.info(`⚡ [PERF] ${metric}: ${value}ms`, data);
  }

  // API request logging
  apiRequest(method, endpoint, statusCode, responseTime, data = {}) {
    const logEntry = this.formatMessage('API', `${method} ${endpoint}`, {
      method,
      endpoint,
      statusCode,
      responseTime,
      ...data
    });
    this.addToLogs(logEntry);

    const emoji = statusCode >= 400 ? '❌' : '✅';
    console.info(`${emoji} [API] ${method} ${endpoint} - ${statusCode} (${responseTime}ms)`);
  }

  // Database logging
  database(operation, collection, duration, data = {}) {
    const logEntry = this.formatMessage('DATABASE', `${operation} on ${collection}`, {
      operation,
      collection,
      duration,
      ...data
    });
    this.addToLogs(logEntry);

    console.info(`🗄️ [DB] ${operation} on ${collection} - ${duration}ms`);
  }

  // Send to external logging service (placeholder)
  sendToExternalService(logEntry) {
    // External logging service integration can be added here


    // For now, just log to console in production
    console.log('📊 Production Log:', logEntry);
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
      errors: this.logs.filter(log => log.level === 'ERROR').length,
      warnings: this.logs.filter(log => log.level === 'WARN').length
    };

    // Count by level
    this.logs.forEach(log => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
    });

    return stats;
  }
}

// Global logger instance
const logger = new Logger();

// Convenience functions
const logError = (message, data) => logger.error(message, data);
const logWarn = (message, data) => logger.warn(message, data);
const logInfo = (message, data) => logger.info(message, data);
const logDebug = (message, data) => logger.debug(message, data);
const logSecurity = (event, data) => logger.security(event, data);
const logPerformance = (metric, value, data) => logger.performance(metric, value, data);
const logApiRequest = (method, endpoint, statusCode, responseTime, data) =>
  logger.apiRequest(method, endpoint, statusCode, responseTime, data);
const logDatabase = (operation, collection, duration, data) =>
  logger.database(operation, collection, duration, data);

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
  logDatabase
};
