/**
 * Returns the route template (pattern) for grouping logs, not the literal URL.
 * e.g. /api/memory-palaces/:id instead of /api/memory-palaces/507f1f77bcf86cd799439011?foo=bar
 * req.route is only set after Express matches a route; for 404s we fall back to path without query.
 */
function getRouteTemplate(req) {
  if (req.route && req.route.path) {
    const base = req.baseUrl || '';
    const path = req.route.path.startsWith('/') ? req.route.path : `/${req.route.path}`;
    return base + path;
  }
  return req.path || req.originalUrl?.split('?')[0] || req.url?.split('?')[0] || '';
}

module.exports = { getRouteTemplate };
