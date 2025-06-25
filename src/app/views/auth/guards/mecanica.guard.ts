import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';

export const mecanicaGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if(token == "NotFoundToken") {
    router.navigate(['/mecanica']);
    return false;
  }

  if (token) {
    console.log('Token en mecanicaGuard:', token);
    return true;
  } else {
    router.navigate(['/mecanica']);
    return false;
  }
};