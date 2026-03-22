import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { DialogoConfirmacaoComponent } from '../../shared/dialogo-confirmacao/dialogo-confirmacao.component';
import { ToastService } from '../../../services/toast.service';

export interface Conversao {
  codigo: number;
  unidadeDe: string;
  unidadePara: string;
  operacao: string;
  valor: number;
}

@Component({
  selector: 'app-lista-conversoes',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatDialogModule,
  ],
  templateUrl: './lista-conversoes.component.html',
  styleUrl: './lista-conversoes.component.css'
})
export class ListaConversoesComponent implements AfterViewInit, OnInit {

  displayedColumns = ['unidadeDe', 'unidadePara', 'operacao', 'valor', 'acoes'];
  dataSource = new MatTableDataSource<Conversao>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly urlListar   = `${environment.API}ficha-tecnica/conversoes`;
  private readonly urlGerarPdf = `${environment.API}ficha-tecnica/conversoes/gerar-pdf-lista`;

  constructor(
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.carregarConversoes();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  carregarConversoes(): void {
    this.http.get<Conversao[]>(this.urlListar).subscribe({
      next: (dados) => {
        this.dataSource.data = dados ?? [];
      },
      error: () => {
        this.dataSource.data = [];
        this.toast.erro('ERRO DE CHAMADA HTTP');
      }
    });
  }

  onEditar(conversao: Conversao): void {
    this.router.navigate(['/principal/formulario-conversoes'], {
      state: { conversao }
    });
  }

  onExcluir(conversao: Conversao): void {
    this.dialog.open(DialogoConfirmacaoComponent, {
      width: '360px',
      data: {
        titulo: 'Confirmar Exclusão',
        mensagem: 'Deseja realmente excluir?',
        onConfirmar: () => this.excluirConversao(conversao),
      }
    });
  }

  private excluirConversao(conversao: Conversao): void {
    this.http.delete(`${this.urlListar}/${conversao.codigo}`, { responseType: 'text' }).subscribe({
      next: () => {
        this.toast.sucesso('Conversão excluída com sucesso.');
        this.carregarConversoes();
      },
      error: (err) => {
        const mensagem: string =
          (typeof err?.error === 'string' && err.error.trim())
            ? err.error.trim()
            : (err?.message ?? 'ERRO AO EXCLUIR CONVERSÃO.');
        this.toast.erro(mensagem);
      }
    });
  }

  onImprimir(): void {
    this.http.get(this.urlGerarPdf, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const now = new Date();
        const aaaa = now.getFullYear().toString();
        const mm   = (now.getMonth() + 1).toString().padStart(2, '0');
        const dd   = now.getDate().toString().padStart(2, '0');
        const hh   = now.getHours().toString().padStart(2, '0');
        const min  = now.getMinutes().toString().padStart(2, '0');
        const ss   = now.getSeconds().toString().padStart(2, '0');
        const filename = `lista-conversoes-${aaaa}${mm}${dd}-${hh}:${min}:${ss}.pdf`;

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        this.toast.erro('ERRO AO GERAR PDF');
      }
    });
  }

  onNovo(): void {
    this.router.navigate(['/principal/formulario-conversoes']);
  }
}
