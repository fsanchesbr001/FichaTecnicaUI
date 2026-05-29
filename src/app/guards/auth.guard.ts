import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { JwtService } from '../services/jwt.service';

function validarAcesso(): boolean {
  const jwtService = inject(JwtService);
  const router = inject(Router);

  if (jwtService.hasValidToken()) {
    return true;
  }

  jwtService.removeToken();
  router.navigate(['']);
  return false;
}

export const authGuard: CanActivateFn = () => validarAcesso();

export const authChildGuard: CanActivateChildFn = () => validarAcesso();

