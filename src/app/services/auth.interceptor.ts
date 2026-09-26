import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { JwtService } from './jwt.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);
  const router = inject(Router);

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
  })).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        jwtService.removeToken();
        void router.navigateByUrl('/');
      }
      return throwError(() => error);
    })
  );
};
