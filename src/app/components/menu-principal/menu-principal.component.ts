import { Component } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {MatCard, MatCardContent} from '@angular/material/card';

@Component({
  selector: 'app-menu-principal',
  imports: [CommonModule, MatCard, MatCardContent, NgOptimizedImage],
  templateUrl: './menu-principal.component.html',
  styleUrl: './menu-principal.component.css'
})
export class MenuPrincipalComponent {
  selectedMenu: string | null = null;
  selectedSubmenu: string | null = null;

  selectMenu(menu: string) {
    this.selectedMenu = menu;
    this.selectedSubmenu = null; // Limpa o submenu ao selecionar um menu
  }

  selectSubmenu(submenu: string) {
    this.selectedSubmenu = submenu;
  }
}
