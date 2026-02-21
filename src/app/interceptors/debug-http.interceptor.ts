import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class DebugHttpInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔵 [HTTP Interceptor] Requisição enviada:');
    console.log('   Método:', request.method);
    console.log('   URL:', request.url);
    console.log('   Headers:', request.headers);
    console.log('   Body:', request.body);

    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {
          console.log('🟢 [HTTP Interceptor] Resposta recebida:', event);
        },
        (error) => {
          console.error('🔴 [HTTP Interceptor] Erro na requisição:', error);
        }
      )
    );
  }
}

