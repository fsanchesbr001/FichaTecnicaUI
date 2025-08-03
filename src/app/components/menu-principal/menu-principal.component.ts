import { Component } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {MatCard, MatCardContent} from '@angular/material/card';

interface Submenu {
  label: string;
  selected?: boolean;
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
  menus: Menu[] = [
    {
      label: 'Usuários',
      isOpen: false,
      submenus: [
        { label: 'Gerenciar' }
      ]
    },
    {
      label: 'Sistema',
      isOpen: false,
      submenus: [
        { label: 'Sobre' }
      ]
    }
  ];

  selectedSubmenu: string | null = null;

  toggleMenu(menu: Menu) {
    menu.isOpen = !menu.isOpen;
  }

  selectSubmenu(submenu: Submenu) {
    this.selectedSubmenu = submenu.label;
  }
}
