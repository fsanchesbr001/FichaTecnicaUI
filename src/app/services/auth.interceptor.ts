import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { JwtService } from './jwt.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);

  const publicUrls = ['/auth/login', '/ficha-tecnica/login-recuperacao-senha'];
  if (publicUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  const token = jwtService.getToken();
  if (!token) {
    return next(req);
  }

  return next(req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  }));
};
