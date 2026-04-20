/** Default (local / development). Production build replaces this file — see `environment.prod.ts`. */
export const environment = {
  production: false,
  /** Backend origin without trailing slash, or empty for same-origin `/api/v1/...`. */
  apiBaseUrl: 'http://localhost:8080',
  /**
   * Google OAuth 2.0 Web client ID (GIS token flow). Create in Google Cloud Console:
   * APIs & Services → Credentials → OAuth client ID → Web application;
   * Authorized JavaScript origins: http://localhost:4200
   */
  googleClientId: '790010214630-m27qbdb2n3o3v6cdrof32q7di530cup8.apps.googleusercontent.com',
};

/** Base path for REST API (e.g. `http://localhost:8080/api/v1` or `/api/v1`). */
export function apiRoot(): string {
  const b = (environment.apiBaseUrl ?? '').replace(/\/$/, '');
  return b ? `${b}/api/v1` : '/api/v1';
}
