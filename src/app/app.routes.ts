import { Routes } from '@angular/router';
import {TelaPrincipalComponent} from './components/tela-principal/tela-principal.component';
import {ListaUsuariosComponent} from './components/usuarios/lista-usuarios/lista-usuarios.component';
import {FormularioUsuariosComponent} from './components/usuarios/formulario-usuarios/formulario-usuarios.component';

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
  },
  {
    path: 'principal',
    component: TelaPrincipalComponent,
    children: [
      { path: 'lista-usuarios', component: ListaUsuariosComponent },
      { path: 'formulario-usuarios', component: FormularioUsuariosComponent},
    ]
  }
];
