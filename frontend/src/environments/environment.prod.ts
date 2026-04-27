export const environment = {
  production: true,
  /** Deploy behind same host as the SPA and proxy `/api` to Spring, or set at build time. */
  apiBaseUrl: '',
  googleClientId: '790010214630-m27qbdb2n3o3v6cdrof32q7di530cup8.apps.googleusercontent.com',
};

export function apiRoot(): string {
  const b = (environment.apiBaseUrl ?? '').replace(/\/$/, '');
  return b ? `${b}/api/v1` : '/api/v1';
}
