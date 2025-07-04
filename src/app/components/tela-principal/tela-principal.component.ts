import { Component } from '@angular/core';
import {MatSidenavContainer, MatSidenavContent, MatSidenavModule} from '@angular/material/sidenav';
import {MenuPrincipalComponent} from '../menu-principal/menu-principal.component';

@Component({
  selector: 'app-tela-principal',
  imports: [MatSidenavContainer,MatSidenavContent,MatSidenavModule,MenuPrincipalComponent],
  templateUrl: './tela-principal.component.html',
  styleUrl: './tela-principal.component.css'
})
export class TelaPrincipalComponent {

}
