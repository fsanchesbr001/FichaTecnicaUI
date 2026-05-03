import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JwtService } from '../../services/jwt.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subject, interval, takeUntil } from 'rxjs';

interface JwtPayload {
  sub?: string;
  nome?: string;
  perfil?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

@Component({
  selector: 'app-info-seguranca',
  imports: [CommonModule],
  templateUrl: './info-seguranca.component.html',
  styleUrl: './info-seguranca.component.css'
})
export class InfoSegurancaComponent implements OnInit, OnDestroy {
  usuario: string = '';
  perfil: string = '';
  tempoRestante: string = '';
  alertaAtivo: boolean = false;
  visivel: boolean = true;

  private destroy$ = new Subject<void>();
  private payload: JwtPayload | null = null;
  private logoutExecutado: boolean = false;

  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.carregarInformacoes();
    this.iniciarContagemRegressiva();
  }

  private carregarInformacoes(): void {
    const token = this.jwtService.getToken();
    if (token) {
      this.payload = this.jwtService.decodeToken(token);
      if (this.payload) {
        this.usuario = this.payload['nome'] || this.payload['sub'] || 'Usuário Desconhecido';

        // Extrair perfil da propriedade 'role' e remover o prefixo 'ROLE_'
        const role = this.payload['role'] || '';
        this.perfil = role.replace('ROLE_', '') || 'Sem Perfil';

        this.atualizarTempoRestante();
      }
    }
  }

  private iniciarContagemRegressiva(): void {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.atualizarTempoRestante();
      });
  }

  private atualizarTempoRestante(): void {
    if (!this.payload || !this.payload['exp']) {
      this.tempoRestante = '00 minutos e 00 segundos';
      return;
    }

    const agora = Math.floor(Date.now() / 1000);
    const tempoRestanteSegundos = this.payload['exp'] - agora;

    // Limite de alerta: 2 minutos e 30 segundos = 150 segundos
    const LIMITE_ALERTA = 150;

    if (tempoRestanteSegundos <= 0) {
      this.tempoRestante = '00 minutos e 00 segundos';
      this.alertaAtivo = true;
      this.visivel = true;
      if (!this.logoutExecutado) {
        this.logoutExecutado = true;
        this.executarLogout();
      }
      return;
    }

    const minutos = Math.floor(tempoRestanteSegundos / 60);
    const segundos = tempoRestanteSegundos % 60;
    this.tempoRestante = `${String(minutos).padStart(2, '0')} minutos e ${String(segundos).padStart(2, '0')} segundos`;

    if (tempoRestanteSegundos <= LIMITE_ALERTA) {
      this.alertaAtivo = true;
      // Alterna visibilidade a cada tick (1s) para efeito de piscar
      this.visivel = !this.visivel;
    } else {
      this.alertaAtivo = false;
      this.visivel = true;
    }
  }

  private executarLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.jwtService.removeToken();
        this.router.navigate(['']);
      },
      error: () => {
        this.jwtService.removeToken();
        this.router.navigate(['']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}



