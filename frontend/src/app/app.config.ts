import { ApplicationConfig, provideZoneChangeDetection, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      (req, next) => {
        const token = localStorage.getItem('token');
        if (token) {
          req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
        }
        return next(req).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              window.location.href = '/login';
            }
            return throwError(() => error);
          })
        );
      }
    ]))
  ]
};
