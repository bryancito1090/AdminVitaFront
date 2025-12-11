import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

export const administradorGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const jwtHelper = new JwtHelperService();

  const token = localStorage.getItem('authToken');
  if (!token || jwtHelper.isTokenExpired(token)) {
    router.navigate(['/login']);
    return false;
  }

  const decoded = jwtHelper.decodeToken(token);
  const roles: string[] = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];

  if (roles.includes('Administrador')) {
    return true;
  }

  router.navigate(['/notFound404']);
  return false;
};
