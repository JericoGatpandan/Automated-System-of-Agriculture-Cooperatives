/**
 * Central API configuration.
 *
 * In development: uses http://localhost:8800
 * In Docker/production: the nginx proxy forwards /api → backend:8800,
 * so we use an empty string (relative URLs).
 */
export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8800";

/** Shorthand for API endpoints, e.g. api("/auth/login") → "http://localhost:8800/api/auth/login" */
export function api(path: string): string {
  return `${API_URL}/api${path}`;
}
