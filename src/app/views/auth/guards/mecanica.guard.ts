import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { OrdenTrabajoService } from '../../services/orden-trabajo.service';
import { of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';

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

export const mecanicaOTGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const ordenTrabajoService = inject(OrdenTrabajoService);

  const token = authService.getToken();

  if (!token || token === 'NotFoundToken') {
    router.navigate(['/mecanica']);
    return of(false);
  }

  const codigoOT = route.params['codigo'];

  return ordenTrabajoService.getOrdenTrabajoCodigoMec(codigoOT).pipe(
    map((response) => {
      if(!response) {
        router.navigate(['/mecanica']);
        return false;
      }
      if (response.estado != 3 && response.estado != 4 && response.estado != 5) { // Ajusta según lo que tu backend devuelva
        return true;
      } else {
        router.navigate(['/mecanica']);
        return false;
      }
    }),
    catchError((error) => {
      router.navigate(['/mecanica']);
      return of(false);
    })
  );
};