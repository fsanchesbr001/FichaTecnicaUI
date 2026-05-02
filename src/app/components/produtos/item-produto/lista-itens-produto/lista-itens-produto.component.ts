import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { environment } from '../../../../../../environments/environment';
import { DialogoConfirmacaoComponent } from '../../../shared/dialogo-confirmacao/dialogo-confirmacao.component';
import { ToastService } from '../../../../services/toast.service';
import { FormularioItensProdutoComponent } from '../formulario-itens-produto/formulario-itens-produto.component';

export interface ItemProduto {
  codigo: number;
  nomeProduto: string;
  nomeItem: string;
  qtdeItem: number;
  cdUnidade: number;
  valorItem: string;
}

export interface UnidadeMedida {
  codigo: number;
  nome: string;
  sigla: string;
}

@Component({
  selector: 'app-lista-itens-produto',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatDialogModule,
    CurrencyPipe,
  ],
  templateUrl: './lista-itens-produto.component.html',
  styleUrl: './lista-itens-produto.component.css'
})
export class ListaItensProdutoComponent implements AfterViewInit, OnChanges {

  @Input() codigoProduto!: number;
  @Input() nomeProduto: string = '';

  displayedColumns = ['item', 'quantidade', 'medida', 'valor', 'acoes'];
  dataSource = new MatTableDataSource<ItemProduto>([]);
  unidades: UnidadeMedida[] = [];

  private readonly urlUnidades = `${environment.API}ficha-tecnica/unidades-medida`;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private toast: ToastService,
  ) {}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['codigoProduto'] && this.codigoProduto) {
      this.carregarUnidades();
      this.carregarItens();
    }
  }

  carregarUnidades(): void {
    this.http.get<UnidadeMedida[]>(this.urlUnidades).subscribe({
      next: (dados) => this.unidades = dados ?? [],
      error: () => this.unidades = [],
    });
  }

  getNomeUnidade(cdUnidade: number): string {
    return this.unidades.find(u => u.codigo === cdUnidade)?.nome ?? String(cdUnidade);
  }

  carregarItens(): void {
    const url = `${environment.API}ficha-tecnica/produtos/${this.codigoProduto}/itens`;
    this.http.get<ItemProduto[]>(url).subscribe({
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

  onExcluir(itemProduto: ItemProduto): void {
    this.dialog.open(DialogoConfirmacaoComponent, {
      width: '360px',
      data: {
        titulo: 'Confirmar Exclusão',
        mensagem: 'Deseja realmente excluir este item do produto?',
        onConfirmar: () => this.excluirItemProduto(itemProduto),
      }
    });
  }

  private excluirItemProduto(itemProduto: ItemProduto): void {
    const url = `${environment.API}ficha-tecnica/produtos/${this.codigoProduto}/itens/${itemProduto.codigo}`;
    this.http.delete(url, { responseType: 'text' }).subscribe({
      next: () => {
        this.toast.sucesso('Item removido do produto com sucesso.');
        this.carregarItens();
      },
      error: (err) => {
        const mensagem: string =
          (typeof err?.error === 'string' && err.error.trim())
            ? err.error.trim()
            : (err?.message ?? 'ERRO AO EXCLUIR ITEM DO PRODUTO.');
        this.toast.erro(mensagem);
      }
    });
  }

  onNovo(): void {
    const ref = this.dialog.open(FormularioItensProdutoComponent, {
      width: '520px',
      disableClose: true,
      data: {
        codigoProduto: this.codigoProduto,
        nomeProduto:   this.nomeProduto,
      }
    });

    ref.afterClosed().subscribe((resultado: boolean) => {
      if (resultado) {
        this.carregarItens();
      }
    });
  }
}
