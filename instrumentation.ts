/**
 * Next.js Instrumentation
 * Used for setting up monitoring, tracing, and error tracking
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import Sentry only on the server
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Import Sentry edge configuration
    await import('./sentry.edge.config')
  }
}
