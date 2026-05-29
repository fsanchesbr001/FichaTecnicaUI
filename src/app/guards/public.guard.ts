import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JwtService } from '../services/jwt.service';

export const publicGuard: CanActivateFn = () => {
  const jwtService = inject(JwtService);
  const router = inject(Router);

  if (jwtService.hasValidToken()) {
    router.navigate(['/principal/lista-produtos']);
    return false;
  }

  return true;
};

