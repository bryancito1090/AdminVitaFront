import { CanActivateFn } from '@angular/router';

export const mecanicaGuard: CanActivateFn = (route, state) => {
  return true;
};
