import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JwtService } from '../services/jwt.service';

export const publicGuard: CanActivateFn = () => {
  const jwtService = inject(JwtService);
  const router = inject(Router);

  // Token técnico do usuário System (fluxo de recuperação de senha/primeiro acesso)
  // não deve ser tratado como sessão de usuário logado.
  if (jwtService.hasValidToken() && !jwtService.isSystemToken()) {
    router.navigate(['/principal/lista-produtos']);
    return false;
  }

  return true;
};

