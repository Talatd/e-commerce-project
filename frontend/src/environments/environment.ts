/** Default (local / development). Production build replaces this file — see `environment.prod.ts`. */
export const environment = {
  production: false,
  /** Backend origin without trailing slash, or empty for same-origin `/api/v1/...`. */
  apiBaseUrl: 'http://localhost:8080',
};

/** Base path for REST API (e.g. `http://localhost:8080/api/v1` or `/api/v1`). */
export function apiRoot(): string {
  const b = (environment.apiBaseUrl ?? '').replace(/\/$/, '');
  return b ? `${b}/api/v1` : '/api/v1';
}
