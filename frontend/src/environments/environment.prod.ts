export const environment = {
  production: true,
  /** Deploy behind same host as the SPA and proxy `/api` to Spring, or set at build time. */
  apiBaseUrl: '',
};

export function apiRoot(): string {
  const b = (environment.apiBaseUrl ?? '').replace(/\/$/, '');
  return b ? `${b}/api/v1` : '/api/v1';
}
