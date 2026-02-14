import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  const expectedRoles = route.data?.['roles'] as string[] | undefined;

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (expectedRoles && !expectedRoles.some((role) => authService.hasRole(role))) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
