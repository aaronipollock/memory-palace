/**
 * Sentry is initialized from the API entry point: server/instrument.js (required first by server/server.js).
 * Set SENTRY_DSN in server/.env — do not commit real DSNs to the repo.
 */
module.exports = require('./server/instrument.js');
