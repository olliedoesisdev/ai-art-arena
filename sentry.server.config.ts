/**
 * Sentry Server Configuration
 * Error tracking and performance monitoring for server-side code
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out sensitive data
  beforeSend(event) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_ENABLE_DEV) {
      return null
    }

    // Filter out personally identifiable information
    if (event.request) {
      delete event.request.cookies
    }

    // Filter out sensitive headers
    if (event.request?.headers) {
      const headers = event.request.headers as Record<string, string>
      delete headers['authorization']
      delete headers['cookie']
    }

    return event
  },

  environment: process.env.NODE_ENV,
})
