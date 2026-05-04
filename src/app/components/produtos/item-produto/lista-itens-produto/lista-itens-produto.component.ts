import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../../environments/environment';
import { DialogoConfirmacaoComponent } from '../../../shared/dialogo-confirmacao/dialogo-confirmacao.component';
import { ToastService } from '../../../../services/toast.service';
import { FormularioItensProdutoComponent } from '../formulario-itens-produto/formulario-itens-produto.component';

export interface ItemProduto {
  codigo?: number;
  cdItem?: number;
  idItem?: number;
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
  ],
  templateUrl: './lista-itens-produto.component.html',
  styleUrl: './lista-itens-produto.component.css'
})
export class ListaItensProdutoComponent implements AfterViewInit, OnChanges {

  @Input() codigoProduto!: number;
  @Input() nomeProduto: string = '';
  @Output() valorItensAtualizado = new EventEmitter<number>();

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

  private calcularTotalItens(itens: ItemProduto[]): number {
    return (itens ?? []).reduce((acc, item) => acc + this.parseValorItem(item.valorItem), 0);
  }

  private parseValorItem(valor: string | number | null | undefined): number {
    if (valor == null) return 0;
    if (typeof valor === 'number') return valor;
    const limpo = String(valor)
      .replace(/[R$\s\u00A0]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    return parseFloat(limpo) || 0;
  }

  private obterIdItem(itemProduto: ItemProduto): number | null {
    return itemProduto.cdItem ?? itemProduto.idItem ?? itemProduto.codigo ?? null;
  }

  private normalizarRespostaItens(dados: any): ItemProduto[] {
    if (Array.isArray(dados)) return dados;
    if (Array.isArray(dados?.itens)) return dados.itens;
    if (Array.isArray(dados?.content)) return dados.content;
    return [];
  }

  carregarItens(): void {
    const url = `${environment.API}ficha-tecnica/produtos/${this.codigoProduto}/itens`;
    this.http.get<any>(url).subscribe({
      next: (dados) => {
        const itens = this.normalizarRespostaItens(dados);
        this.dataSource.data = itens;

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          this.paginator.firstPage();
        }

        this.valorItensAtualizado.emit(this.calcularTotalItens(itens));
      },
      error: () => {
        this.dataSource.data = [];
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          this.paginator.firstPage();
        }
        this.valorItensAtualizado.emit(0);
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
    const idItem = this.obterIdItem(itemProduto);
    if (idItem == null) {
      this.toast.erro('Não foi possível identificar o item para exclusão.');
      return;
    }

    const url = `${environment.API}ficha-tecnica/produtos/${this.codigoProduto}/itens/${idItem}`;
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
