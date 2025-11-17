/**
 * Environment utilities for detecting and managing environment-specific configurations
 */

/**
 * Get the current environment
 */
export function getEnvironment() {
  return process.env.NODE_ENV || 'development';
}

/**
 * Check if running in production
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running on Vercel
 */
export function isVercel() {
  return !!process.env.VERCEL;
}

/**
 * Get the base URL for the application
 * Returns the correct URL based on environment
 */
export function getBaseUrl() {
  // Browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Vercel production
  if (process.env.VERCEL_URL && isProduction()) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Use configured site URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Fallback to localhost
  return 'http://localhost:3000';
}

/**
 * Get the full URL for a path
 */
export function getFullUrl(path: string) {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Get the API base URL
 */
export function getApiUrl() {
  return `${getBaseUrl()}/api`;
}

/**
 * Environment-specific configuration
 */
export const envConfig = {
  siteUrl: getBaseUrl(),
  apiUrl: getApiUrl(),
  environment: getEnvironment(),
  isProduction: isProduction(),
  isDevelopment: isDevelopment(),
  isVercel: isVercel(),
} as const;
