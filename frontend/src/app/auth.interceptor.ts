import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector, runInInjectionContext } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './services';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);
  const token = localStorage.getItem('token');
  const authed = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authed).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }
      const url = req.url;
      const skipRefresh =
        req.headers.has('X-Auth-Retry') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/login') ||
        url.includes('/auth/register');
      if (skipRefresh) {
        if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return throwError(() => error);
      }
      return runInInjectionContext(injector, () => {
        const auth = inject(AuthService);
        return auth.refreshAccessToken().pipe(
          switchMap((ok) => {
            if (!ok) {
              auth.logout();
              window.location.href = '/login';
              return throwError(() => error);
            }
            const fresh = localStorage.getItem('token');
            let h = req.headers.delete('Authorization').set('X-Auth-Retry', '1');
            if (fresh) {
              h = h.set('Authorization', `Bearer ${fresh}`);
            }
            return next(req.clone({ headers: h }));
          }),
        );
      });
    }),
  );
};
