import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { JwtService } from '../services/jwt.service';

function validarAcesso(): boolean {
  const jwtService = inject(JwtService);
  const router = inject(Router);

  if (jwtService.hasValidToken()) {
    // Token técnico do usuário System (fluxo de recuperação de senha/primeiro acesso)
    // não concede acesso às telas da aplicação principal, mas não deve ser removido
    // pois ainda é necessário para concluir o fluxo de troca de senha.
    if (!jwtService.isSystemToken()) {
      return true;
    }
    router.navigate(['']);
    return false;
  }

  jwtService.removeToken();
  router.navigate(['']);
  return false;
}

export const authGuard: CanActivateFn = () => validarAcesso();

export const authChildGuard: CanActivateChildFn = () => validarAcesso();

