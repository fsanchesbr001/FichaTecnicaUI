import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { DialogoConfirmacaoComponent } from '../../shared/dialogo-confirmacao/dialogo-confirmacao.component';
import { ToastService } from '../../../services/toast.service';

export interface Medida {
  codigo: number;
  nome: string;
  sigla: string;
}

@Component({
  selector: 'app-lista-unidades',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatDialogModule,
  ],
  templateUrl: './lista-unidades.component.html',
  styleUrl: './lista-unidades.component.css'
})
export class ListaUnidadesComponent implements AfterViewInit, OnInit {
  displayedColumns = ['nome', 'sigla', 'acoes'];
  dataSource = new MatTableDataSource<Medida>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly urlListar = `${environment.API}ficha-tecnica/unidades-medida`;
  private readonly urlGerarPdfCandidatas = [
    `${environment.API}ficha-tecnica/unidades-medida/relatorios/lista`,
    `${environment.API}ficha-tecnica/unidades-medidas/gerar-pdf-lista`,
    `${environment.API}ficha-tecnica/relatorios/unidades-medida/gerar-pdf-lista`,
    `${environment.API}ficha-tecnica/relatorios/unidades-medidas/gerar-pdf-lista`,
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.carregarUnidades();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  carregarUnidades(): void {
    this.http.get<Medida[]>(this.urlListar).subscribe({
      next: (dados) => {
        this.dataSource.data = dados ?? [];
      },
      error: () => {
        this.dataSource.data = [];
        this.toast.erro('ERRO DE CHAMADA HTTP');
      }
    });
  }

  onEditar(medida: Medida): void {
    this.router.navigate(['/principal/formulario-medidas'], {
      state: { medida }
    });
  }

  onExcluir(medida: Medida): void {
    this.dialog.open(DialogoConfirmacaoComponent, {
      width: '360px',
      data: {
        titulo: 'Confirmar Exclusão',
        mensagem: 'Deseja realmente excluir?',
        onConfirmar: () => this.excluirUnidade(medida),
      }
    });
  }

  private excluirUnidade(medida: Medida): void {
    this.http.delete(`${this.urlListar}/${medida.codigo}`, { responseType: 'text' }).subscribe({
      next: () => {
        this.toast.sucesso('Unidade de medida excluída com sucesso.');
        this.carregarUnidades();
      },
      error: (err) => {
        const mensagem: string =
          (typeof err?.error === 'string' && err.error.trim())
            ? err.error.trim()
            : (err?.message ?? 'ERRO AO EXCLUIR UNIDADE DE MEDIDA.');
        this.toast.erro(mensagem);
      }
    });
  }

  onImprimir(): void {
    const now = new Date();
    const aaaa = now.getFullYear().toString();
    const mm   = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd   = now.getDate().toString().padStart(2, '0');
    const hh   = now.getHours().toString().padStart(2, '0');
    const min  = now.getMinutes().toString().padStart(2, '0');
    const ss   = now.getSeconds().toString().padStart(2, '0');
    const filename = `lista-medidas-${aaaa}${mm}${dd}-${hh}:${min}:${ss}.pdf`;

    this.tentarGerarPdf(0, filename);
  }

  onNovo(): void {
    this.router.navigate(['/principal/formulario-medidas']);
  }

  private tentarGerarPdf(indiceUrl: number, filename: string): void {
    const url = this.urlGerarPdfCandidatas[indiceUrl];
    if (!url) {
      this.toast.erro('ERRO AO GERAR PDF');
      return;
    }

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => this.baixarArquivo(blob, filename),
      error: (err: HttpErrorResponse) => {
        if ((err.status === 404 || err.status === 405) && indiceUrl < this.urlGerarPdfCandidatas.length - 1) {
          this.tentarGerarPdf(indiceUrl + 1, filename);
          return;
        }

        this.toast.erro(this.extrairMensagemErro(err, 'ERRO AO GERAR PDF'));
      }
    });
  }

  private baixarArquivo(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private extrairMensagemErro(err: HttpErrorResponse, fallback: string): string {
    const body = err?.error;
    if (typeof body === 'string' && body.trim()) return body.trim();
    if (body?.message && typeof body.message === 'string') return body.message;
    if (body?.erro && typeof body.erro === 'string') return body.erro;
    if (err?.message) return err.message;
    return fallback;
  }
}
