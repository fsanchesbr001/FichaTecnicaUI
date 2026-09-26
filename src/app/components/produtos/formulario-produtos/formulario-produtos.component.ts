import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { Router, Navigation } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../services/toast.service';
import { ApiErrorService } from '../../../services/api-error.service';
import { ListaItensProdutoComponent } from '../item-produto/lista-itens-produto/lista-itens-produto.component';
import { GraficoPizzaProdutoComponent } from '../grafico-pizza-produto/grafico-pizza-produto.component';
import { SeletorArquivoImagemComponent } from '../../shared/seletor-arquivo-imagem/seletor-arquivo-imagem.component';

@Component({
  selector: 'app-formulario-produtos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardTitle,
    MatFormField,
    MatError,
    MatIcon,
    MatLabel,
    MatInput,
    MatSuffix,
    MatButton,
    ListaItensProdutoComponent,
    GraficoPizzaProdutoComponent,
    SeletorArquivoImagemComponent,
  ],
  templateUrl: './formulario-produtos.component.html',
  styleUrl: './formulario-produtos.component.css'
})
export class FormularioProdutosComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  salvando = false;
  protected produtoParaEditar: any = null;
  graficoAtualizacaoToken = 0;
  arquivoImagemSelecionado: File | null = null;

  private previewImagemUrl: string | null = null;
  private imagemAlteradaManualmente = false;

  private readonly urlProdutos = `${environment.API}ficha-tecnica/produtos`;
  private readonly urlGerarPdf = `${environment.API}ficha-tecnica/produtos/gerar-pdf-detalhe`;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
    private apiErrorService: ApiErrorService,
  ) {
    const nav: Navigation | null = this.router.getCurrentNavigation();
    this.produtoParaEditar = nav?.extras?.state?.['produto'] ?? null;

    this.form = this.fb.group({
      nome:        ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      descricao:   ['', [Validators.maxLength(255)]],
      imagem:      ['', [Validators.maxLength(255)]],
      valorVenda:  ['0,00', [Validators.required]],
      valorItens:  [{ value: '0,00', disabled: true }],
    });
  }

  ngOnInit(): void {
    if (this.produtoParaEditar) {
      this.preencherFormulario(this.produtoParaEditar);
    }
  }

  ngOnDestroy(): void {
    this.revogarPreviewImagem();
  }

  get imagemIlustrativaUrl(): string {
    if (this.previewImagemUrl) {
      return this.previewImagemUrl;
    }

    const valorAtual = String(this.form.get('imagem')?.value ?? '').trim();
    if (valorAtual) {
      return this.resolverUrlImagem(valorAtual);
    }

    if (!this.imagemAlteradaManualmente) {
      const imagemPersistida = String(this.produtoParaEditar?.imagem ?? '').trim();
      return this.resolverUrlImagem(imagemPersistida);
    }

    return '';
  }

  get mensagemErroImagem(): string | null {
    if (this.form.get('imagem')?.hasError('maxlength')) {
      return 'Imagem deve ter no máximo 255 caracteres';
    }

    return null;
  }

  private parseMoeda(valor: string | number | null | undefined): string {
    if (valor == null) return '0,00';
    const str = String(valor);
    // Remove "R$ ", pontos de milhar e substitui vírgula por ponto
    const limpo = str.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
    const num = parseFloat(limpo);
    if (isNaN(num)) return '0,00';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  }

  private preencherFormulario(produto: any): void {
    this.form.patchValue({
      nome:       produto.nome       ?? '',
      descricao:  produto.descricao  ?? '',
      imagem:     produto.imagem     ?? '',
      valorVenda: this.parseMoeda(produto.valorVenda),
      valorItens: this.parseMoeda(produto.valorItens),
    });
  }

  private extrairMensagemErro(err: any, fallback = 'ERRO DE CHAMADA HTTP'): string {
    return this.apiErrorService.extrairMensagem(err, fallback);
  }

  /** Converte "1.234,56" (PT-BR) → 1234.56 (formato numérico para o backend) */
  private converterParaNumero(mascara: string | number | null | undefined): number {
    if (mascara == null || mascara === '') return 0;
    const str = String(mascara);
    // Remove pontos de milhar e substitui vírgula decimal por ponto
    const limpo = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(limpo) || 0;
  }

  private formatarMoedaSemPrefixo(valor: number): string {
    const valorNormalizado = Number.isFinite(valor) ? valor : 0;
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valorNormalizado);
  }

  onMoedaInput(controlName: string, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const ctrl = this.form.get(controlName);
    if (!input || !ctrl) return;

    let texto = (input.value ?? '').replace(/[^\d,]/g, '');
    if (!texto) {
      ctrl.setValue('', { emitEvent: false });
      return;
    }

    const idx = texto.indexOf(',');
    if (idx >= 0) {
      texto = `${texto.substring(0, idx + 1)}${texto.substring(idx + 1).replace(/,/g, '')}`;
    }

    const temVirgula = texto.includes(',');
    const [parteInteira = '', parteDecimal = ''] = texto.split(',');
    const inteiroLimpo = parteInteira.replace(/^0+(?=\d)/, '');
    const inteiroComMilhar = (inteiroLimpo || '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimalLimitado = parteDecimal.replace(/\D/g, '').substring(0, 2);
    const formatado = temVirgula ? `${inteiroComMilhar},${decimalLimitado}` : inteiroComMilhar;

    input.value = formatado;
    ctrl.setValue(formatado, { emitEvent: false });
  }

  onValorItensAtualizado(total: number): void {
    this.form.get('valorItens')?.setValue(this.formatarMoedaSemPrefixo(total), { emitEvent: false });
    this.graficoAtualizacaoToken++;
  }

  onImagemSelecionada(file: File | null): void {
    this.arquivoImagemSelecionado = file;
    this.imagemAlteradaManualmente = true;
    this.revogarPreviewImagem();

    if (file) {
      this.previewImagemUrl = URL.createObjectURL(file);
    }
  }

  onSalvar(): void {
    if (this.form.invalid) {
      this.toast.aviso('Por favor, corrija os erros no formulário.');
      return;
    }
    this.salvando = true;
    if (this.produtoParaEditar) {
      this.atualizarProduto();
    } else {
      this.registrarProduto();
    }
  }

  private montarPayload(): object {
    const raw = this.form.getRawValue();
    return {
      nome:       raw.nome,
      descricao:  raw.descricao  ?? '',
      imagem:     raw.imagem     ?? '',
      valorVenda: this.converterParaNumero(raw.valorVenda),
      valorItens: this.converterParaNumero(raw.valorItens),
    };
  }

  private registrarProduto(): void {
    this.http.post<any>(this.urlProdutos, this.montarPayload()).pipe(
      switchMap((produto) => {
        const idProduto = produto?.codigo ?? produto?.id ?? produto?.produtoId;
        if (this.arquivoImagemSelecionado && idProduto) {
          return this.uploadImagem(idProduto).pipe(
            catchError(() => {
              this.toast.aviso('Produto salvo, mas ocorreu um erro ao fazer o upload da imagem.');
              return of(null);
            })
          );
        }
        return of(null);
      })
    ).subscribe({
      next: () => {
        this.toast.sucesso('Produto registrado com sucesso.');
        this.router.navigate(['/principal/lista-produtos']);
      },
      error: (err) => {
        this.salvando = false;
        this.toast.erro(this.extrairMensagemErro(err, 'ERRO AO SALVAR PRODUTO'));
      }
    });
  }

  private atualizarProduto(): void {
    this.http.put<any>(`${this.urlProdutos}/${this.produtoParaEditar.codigo}`, this.montarPayload()).pipe(
      switchMap(() => {
        if (this.arquivoImagemSelecionado) {
          return this.uploadImagem(this.produtoParaEditar.codigo).pipe(
            catchError(() => {
              this.toast.aviso('Produto salvo, mas ocorreu um erro ao fazer o upload da imagem.');
              return of(null);
            })
          );
        }
        return of(null);
      })
    ).subscribe({
      next: () => {
        this.toast.sucesso('Produto atualizado com sucesso.');
        this.router.navigate(['/principal/lista-produtos']);
      },
      error: (err) => {
        this.salvando = false;
        this.toast.erro(this.extrairMensagemErro(err, 'ERRO AO SALVAR PRODUTO'));
      }
    });
  }

  private uploadImagem(idProduto: number): ReturnType<HttpClient['post']> {
    const formData = new FormData();
    formData.append('file', this.arquivoImagemSelecionado!, this.arquivoImagemSelecionado!.name);
    return this.http.post(`${this.urlProdutos}/${idProduto}/imagem/upload`, formData);
  }

  /** Normaliza o campo monetário ao sair: garante sempre 2 casas decimais */
  normalizarMoeda(controlName: string): void {
    const ctrl = this.form.get(controlName);
    if (!ctrl) return;

    let valor = String(ctrl.value ?? '').replace(/[^\d,]/g, '').trim();
    if (!valor || valor === ',') {
      ctrl.setValue('0,00', { emitEvent: false });
      return;
    }

    const idx = valor.indexOf(',');
    if (idx >= 0) {
      valor = `${valor.substring(0, idx + 1)}${valor.substring(idx + 1).replace(/,/g, '')}`;
    }

    const [parteInteira = '', parteDecimal = ''] = valor.split(',');
    const inteiroLimpo = parteInteira.replace(/^0+(?=\d)/, '');
    const inteiroComMilhar = (inteiroLimpo || '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimal = parteDecimal.replace(/\D/g, '').substring(0, 2);

    if (!decimal) {
      ctrl.setValue(`${inteiroComMilhar},00`, { emitEvent: false });
      return;
    }

    if (decimal.length === 1) {
      ctrl.setValue(`${inteiroComMilhar},${decimal}0`, { emitEvent: false });
      return;
    }

    ctrl.setValue(`${inteiroComMilhar},${decimal}`, { emitEvent: false });
  }

  onCancelar(): void {
    this.router.navigate(['/principal/lista-produtos']);
  }

  onImprimir(): void {
    if (!this.produtoParaEditar) return;

    this.http.get(`${this.urlGerarPdf}/${this.produtoParaEditar.codigo}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const now   = new Date();
        const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_`
                    + `${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
        const filename = `detalhe-produto-${stamp}.pdf`;

        const url    = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href     = url;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.toast.erro('ERRO AO GERAR PDF')
    });
  }

  private ehUrlImagem(valor: string): boolean {
    return /^(https?:\/\/|\/|data:image\/)/i.test(valor);
  }

  private resolverUrlImagem(valor: string): string {
    const caminho = valor.trim();
    if (!caminho) {
      return '';
    }

    if (this.ehUrlImagem(caminho)) {
      return caminho;
    }

    const apiBase = environment.API.replace(/\/+$/, '');
    const caminhoNormalizado = caminho
      .replace(/^\/+/, '')
      .replace(/^api\/imagens\/+/i, '');

    return `${apiBase}/api/imagens/${caminhoNormalizado}`;
  }

  private revogarPreviewImagem(): void {
    if (this.previewImagemUrl) {
      URL.revokeObjectURL(this.previewImagemUrl);
      this.previewImagemUrl = null;
    }
  }
}
