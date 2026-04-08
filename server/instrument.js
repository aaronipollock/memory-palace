/**
 * Sentry must load before other app modules so instrumentation wraps them correctly.
 * CommonJS entrypoint for the Node/Express backend.
 *
 * Notes:
 * - Do NOT use @sentry/browser here (frontend-only).
 * - Keep DSN in server/.env (SENTRY_DSN), not in source.
 * - For request tracing (Performance), set SENTRY_TRACES_SAMPLE_RATE (e.g. 1.0 for local testing).
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Sentry = require('@sentry/node');

const dsn = process.env.SENTRY_DSN;
if (dsn) {
  const rateRaw = process.env.SENTRY_TRACES_SAMPLE_RATE;
  const tracesSampleRate =
    rateRaw === undefined || rateRaw === ''
      ? undefined
      : Math.max(0, Math.min(1, Number(rateRaw)));

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    sendDefaultPii: process.env.SENTRY_SEND_DEFAULT_PII === 'true',
    // Enable request tracing (optional)
    ...(tracesSampleRate === undefined || Number.isNaN(tracesSampleRate) ? {} : { tracesSampleRate })
  });
}

module.exports = Sentry;
