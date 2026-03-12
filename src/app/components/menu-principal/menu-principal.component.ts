import { Component, OnInit } from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCard, MatCardContent} from '@angular/material/card';
import {Router, NavigationEnd} from '@angular/router';
import {filter} from 'rxjs/operators';
import {AuthService} from '../../services/auth.service';
import {JwtService} from '../../services/jwt.service';

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
  imports: [CommonModule, MatCard, MatCardContent],
  templateUrl: './menu-principal.component.html',
  styleUrl: './menu-principal.component.css'
})
export class MenuPrincipalComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService, private jwtService: JwtService) {}

  ngOnInit(): void {
    // Detecta a rota atual ao inicializar o componente
    this.detectarRotaAtiva(this.router.url);

    // Observa mudanças de navegação
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.detectarRotaAtiva(event.url);
    });
  }

  /**
   * Detecta a rota ativa e seleciona o submenu correspondente
   */
  private detectarRotaAtiva(url: string): void {
    for (const menu of this.menus) {
      for (const submenu of menu.submenus) {
        if (submenu.routePath && url.includes(submenu.routePath)) {
          this.selectedSubmenu = submenu.label;
          menu.isOpen = true; // Expande o menu pai
          return;
        }
      }
    }
  }
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
      label: 'Itens em estoque',
      isOpen: false,
      submenus: [
        { label: 'Gerenciar Itens',
          routePath: '/principal/lista-item' }
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
    // Verifica se o menu contém o submenu selecionado
    const contemSubmenuSelecionado = this.selectedSubmenu &&
      menu.submenus.some(sub => sub.label === this.selectedSubmenu);

    // Se o menu está aberto e contém o submenu selecionado, não permite fechar
    if (menu.isOpen && contemSubmenuSelecionado) {
      return; // Não faz nada, mantém o menu aberto
    }

    // Caso contrário, faz o toggle normalmente
    menu.isOpen = !menu.isOpen;
  }

  selectSubmenu(submenu: Submenu) {
    // Trata o logout separadamente
    if (submenu.label === 'Sair') {
      this.realizarLogout();
      return;
    }

    this.selectedSubmenu = submenu.label;

    // Fechar todos os menus e abrir apenas o menu pai do submenu clicado
    for (const menu of this.menus) {
      const contemSubmenu = menu.submenus.some(sub => sub.label === submenu.label);
      menu.isOpen = contemSubmenu; // Apenas o menu pai fica aberto
    }

    // Navegar para a rota se existir
    if (submenu.routePath) {
      this.router.navigate([submenu.routePath]);
    }
  }

  /**
   * Chama o endpoint de logout, limpa o token e redireciona para o login
   */
  private realizarLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.jwtService.removeToken();
        this.router.navigate(['']);
      },
      error: () => {
        // Mesmo em caso de erro, limpa o token e redireciona
        this.jwtService.removeToken();
        this.router.navigate(['']);
      }
    });
  }
}
