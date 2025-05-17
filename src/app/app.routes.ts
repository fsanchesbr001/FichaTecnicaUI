import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path : '',
    loadComponent: () => import('./components/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'recuperar-senha',
    loadComponent: () => import('./components/recuperar-senha/recuperar-senha.component')
      .then(m => m.RecuperarSenhaComponent)
  },
  {
    path: 'solicitar-token',
    loadComponent: () => import('./components/solicitar-token/solicitar-token.component')
      .then(m => m.SolicitarTokenComponent)
  }
];
