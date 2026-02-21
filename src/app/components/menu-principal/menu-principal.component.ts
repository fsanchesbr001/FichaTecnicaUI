import { Component } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {MatCard, MatCardContent} from '@angular/material/card';
import {Router} from '@angular/router';

interface Submenu {
  label: string;
  selected?: boolean;
  routePath?: string;
}

interface Menu {
  label: string;
  isOpen: boolean;
  submenus: Submenu[];
}

@Component({
  selector: 'app-menu-principal',
  imports: [CommonModule, MatCard, MatCardContent, NgOptimizedImage],
  templateUrl: './menu-principal.component.html',
  styleUrl: './menu-principal.component.css'
})
export class MenuPrincipalComponent {
  constructor(private router: Router) {}
  // Define the structure of the menu
  menus: Menu[] = [
    {
      label: 'Medidas',
      isOpen: false,
      submenus: [
        { label: 'Gerenciar Medidas',
          routePath: '/principal/lista-medidas' }
      ]
    },
    {
      label: 'Conversões',
      isOpen: false,
      submenus: [
        { label: 'Gerenciar Conversões',
          routePath: '/principal/lista-conversoes' }
      ]
    },
    {
      label: 'Usuários',
      isOpen: false,
      submenus: [
        { label: 'Gerenciar Usuários',
          routePath: '/principal/lista-usuarios' },
      ]
    },
    {
      label: 'Sistema',
      isOpen: false,
      submenus: [
        { label: 'Sair' }
      ]
    }
  ];

  selectedSubmenu: string | null = null;

  toggleMenu(menu: Menu) {
    menu.isOpen = !menu.isOpen;
  }

  selectSubmenu(submenu: Submenu) {
    this.selectedSubmenu = submenu.label;
    this.router.navigate([submenu.routePath]);
  }
}
