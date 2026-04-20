import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services';
import { CONSUMER_NAV } from './consumer-nav.paths';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.currentUserValue) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const user = auth.currentUserValue;
    if (user && allowedRoles.includes(user.role)) {
      return true;
    }
    if (!user) {
      router.navigate(['/login']);
    } else {
      router.navigate([CONSUMER_NAV.shop]);
    }
    return false;
  };
};
