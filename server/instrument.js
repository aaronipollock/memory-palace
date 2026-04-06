/**
 * Sentry must load before other app modules so instrumentation wraps them correctly.
 * See: https://docs.sentry.io/platforms/javascript/guides/express/
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Sentry = require('@sentry/node');

const dsn = process.env.SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    sendDefaultPii: process.env.SENTRY_SEND_DEFAULT_PII === 'true'
  });
}

module.exports = Sentry;
