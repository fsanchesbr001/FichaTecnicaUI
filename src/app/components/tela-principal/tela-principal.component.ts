import { Component } from '@angular/core';
import {MatSidenavContainer, MatSidenavContent, MatSidenavModule} from '@angular/material/sidenav';
import {MenuPrincipalComponent} from '../menu-principal/menu-principal.component';
import {InfoSegurancaComponent} from '../info-seguranca/info-seguranca.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-tela-principal',
  imports: [MatSidenavContainer,
    MatSidenavContent,
    MatSidenavModule,
    MenuPrincipalComponent,
    InfoSegurancaComponent,
    RouterOutlet],
  templateUrl: './tela-principal.component.html',
  styleUrl: './tela-principal.component.css'
})
export class TelaPrincipalComponent {

}
