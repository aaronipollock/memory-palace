const { logger } = require('../utils/logger');
const { getRouteTemplate } = require('../utils/routeTemplate');

/**
 * Request logging middleware. Must run after requestIdMiddleware so req.id exists.
 * - Logs one structured line per request (requestId, route template, method, statusCode, duration, userId).
 * - Attaches req.log so handlers can log with requestId (and userId when set) automatically.
 */
const requestLoggingMiddleware = (req, res, next) => {
  req.log = logger.requestLogger(req);
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.apiRequest({
      requestId: req.id,
      route: getRouteTemplate(req),
      method: req.method,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id ?? req.user?._id ?? null
    });
  });

  next();
};

module.exports = requestLoggingMiddleware;
