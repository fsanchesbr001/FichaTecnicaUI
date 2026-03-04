import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { PaginaErroService } from '../../services/pagina-erro.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pagina-erro',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './pagina-erro.component.html',
  styleUrl: './pagina-erro.component.css'
})
export class PaginaErroComponent implements OnInit, OnDestroy {
  mensagem: string = '';
  rotaVoltar: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private paginaErroService: PaginaErroService
  ) {}

  ngOnInit(): void {
    // Subscreve aos dados de erro do serviço
    this.paginaErroService.erroData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(dados => {
        this.mensagem = dados.mensagem;
        this.rotaVoltar = dados.rotaVoltar;
      });
  }

  voltar(): void {
    if (this.rotaVoltar) {
      // Limpa os dados antes de navegar
      this.paginaErroService.limparErro();
      this.router.navigate([this.rotaVoltar]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}





