import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { DialogoConfirmacaoComponent } from '../../shared/dialogo-confirmacao/dialogo-confirmacao.component';
import { ToastService } from '../../../services/toast.service';
import { CommonModule } from '@angular/common';

export interface Produto {
  codigo: number;
  nome: string;
  descricao: string;
  imagem: string;
  valorVenda: string;
  valorItens: string;
}

@Component({
  selector: 'app-lista-produtos',
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
  templateUrl: './lista-produtos.component.html',
  styleUrl: './lista-produtos.component.css'
})
export class ListaProdutosComponent implements AfterViewInit, OnInit {
  displayedColumns = ['nome', 'precoVenda', 'acoes'];
  dataSource = new MatTableDataSource<Produto>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly urlListar   = `${environment.API}ficha-tecnica/produtos`;
  private readonly urlGerarPdf = `${environment.API}ficha-tecnica/produtos/gerar-pdf-lista`;

  constructor(
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  carregarProdutos(): void {
    this.http.get<Produto[]>(this.urlListar).subscribe({
      next: (dados) => {
        this.dataSource.data = dados ?? [];
        this.dataSource.paginator = this.paginator;
      },
      error: () => {
        this.dataSource.data = [];
        this.dataSource.paginator = this.paginator;
        this.toast.erro('ERRO DE CHAMADA HTTP');
      }
    });
  }

  onEditar(produto: Produto): void {
    this.router.navigate(['/principal/formulario-produto'], {
      state: { produto }
    });
  }

  onExcluir(produto: Produto): void {
    this.dialog.open(DialogoConfirmacaoComponent, {
      width: '360px',
      data: {
        titulo: 'Confirmar Exclusão',
        mensagem: 'Deseja realmente excluir?',
        onConfirmar: () => this.excluirProduto(produto),
      }
    });
  }

  private excluirProduto(produto: Produto): void {
    this.http.delete(`${this.urlListar}/${produto.codigo}`, { responseType: 'text' }).subscribe({
      next: () => {
        this.toast.sucesso('Produto excluído com sucesso.');
        this.carregarProdutos();
      },
      error: (err) => {
        const mensagem: string =
          (typeof err?.error === 'string' && err.error.trim())
            ? err.error.trim()
            : (err?.message ?? 'ERRO AO EXCLUIR PRODUTO.');
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
        const filename = `lista-produtos-${aaaa}${mm}${dd}-${hh}:${min}:${ss}.pdf`;

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
    this.router.navigate(['/principal/formulario-produto']);
  }
}

