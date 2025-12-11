import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

export const mecanicaGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const jwtHelper = new JwtHelperService();

  const token = authService.getToken();

  let isExpired = true;
  if (token && token !== 'NotFoundToken') {
    try {
      isExpired = jwtHelper.isTokenExpired(token);
    } catch {
      isExpired = true;
    }
  }

  if (!token || token === 'NotFoundToken' || isExpired) {
    authService.logoutMecanico();
    router.navigate(['/login_mecanica']);
    return false;
  }

  return true;
};
