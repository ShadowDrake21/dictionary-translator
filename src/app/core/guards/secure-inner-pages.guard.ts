import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';

export const secureInnerPagesGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.checkSignIn() === false) {
    router.navigate(['sign-in']);
  }
  return true;
};
