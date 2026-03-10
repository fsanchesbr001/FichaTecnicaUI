import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { JwtService } from './jwt.service';

/**
 * Interceptor que injeta o token JWT em todas as requisições HTTP,
 * exceto na rota de login (que não requer autenticação).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);

  // Não adiciona token na requisição de login
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  const token = jwtService.getToken();

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};

