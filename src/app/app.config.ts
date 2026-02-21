import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';

import { routes } from './app.routes';
import {provideEnvironmentNgxMask } from 'ngx-mask';
import { DebugHttpInterceptor } from './interceptors/debug-http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    { provide: HTTP_INTERCEPTORS, useClass: DebugHttpInterceptor, multi: true },
    provideEnvironmentNgxMask()
  ]
};
