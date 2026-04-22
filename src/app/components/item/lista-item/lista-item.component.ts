import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

export interface UnidadeMedida {
  codigo: number;
  nome: string;
  sigla: string;
}

export interface Item {
  codigo: number;
  nome: string;
  unidadeMedida: UnidadeMedida;
  valor: string; // retornado como string formatada pelo backend (ex: "R$ 6,50")
}

@Component({
  selector: 'app-lista-item',
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
  templateUrl: './lista-item.component.html',
  styleUrl: './lista-item.component.css'
})
export class ListaItemComponent implements AfterViewInit, OnInit {

  displayedColumns = ['nome', 'unidade', 'valor', 'acoes'];
  dataSource = new MatTableDataSource<Item>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly urlListar   = `${environment.API}ficha-tecnica/itens`;
  private readonly urlGerarPdf = `${environment.API}ficha-tecnica/itens/gerar-pdf-lista`;

  constructor(
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.carregarItens();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  carregarItens(): void {
    this.http.get<Item[]>(this.urlListar).subscribe({
      next: (dados) => {
        this.dataSource.data = dados ?? [];
      },
      error: () => {
        this.dataSource.data = [];
        this.toast.erro('ERRO DE CHAMADA HTTP');
      }
    });
  }

  onNovo(): void {
    this.router.navigate(['/principal/formulario-item']);
  }

  onEditar(item: Item): void {
    this.router.navigate(['/principal/formulario-item'], {
      state: { item }
    });
  }

  onExcluir(item: Item): void {
    this.dialog.open(DialogoConfirmacaoComponent, {
      width: '360px',
      data: {
        titulo: 'Confirmar Exclusão',
        mensagem: 'Deseja realmente excluir?',
        onConfirmar: () => this.excluirItem(item),
      }
    });
  }

  private excluirItem(item: Item): void {
    this.http.delete(`${this.urlListar}/${item.codigo}`, { responseType: 'text' }).subscribe({
      next: () => {
        this.toast.sucesso('Item excluído com sucesso.');
        this.carregarItens();
      },
      error: (err) => {
        const mensagem: string =
          (typeof err?.error === 'string' && err.error.trim())
            ? err.error.trim()
            : (err?.message ?? 'ERRO AO EXCLUIR ITEM.');
        this.toast.erro(mensagem);
      }
    });
  }

  onImprimir(): void {
    this.http.get(this.urlGerarPdf, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const now  = new Date();
        const aaaa = now.getFullYear().toString();
        const mm   = (now.getMonth() + 1).toString().padStart(2, '0');
        const dd   = now.getDate().toString().padStart(2, '0');
        const hh   = now.getHours().toString().padStart(2, '0');
        const min  = now.getMinutes().toString().padStart(2, '0');
        const ss   = now.getSeconds().toString().padStart(2, '0');
        const filename = `lista-itens-${aaaa}${mm}${dd}-${hh}:${min}:${ss}.pdf`;

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
}
