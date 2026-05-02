import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { Router, Navigation } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../services/toast.service';
import { ListaItensProdutoComponent } from '../item-produto/lista-itens-produto/lista-itens-produto.component';

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
    NgxMaskDirective,
    ListaItensProdutoComponent,
  ],
  providers: [provideNgxMask()],
  templateUrl: './formulario-produtos.component.html',
  styleUrl: './formulario-produtos.component.css'
})
export class FormularioProdutosComponent implements OnInit {

  form!: FormGroup;
  salvando = false;
  protected produtoParaEditar: any = null;

  private readonly urlProdutos = `${environment.API}ficha-tecnica/produtos`;
  private readonly urlGerarPdf = `${environment.API}ficha-tecnica/produtos/gerar-pdf-detalhe`;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
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

  private parseMoeda(valor: string | number | null | undefined): string {
    if (valor == null) return '0,00';
    const str = String(valor);
    // Remove "R$ ", pontos de milhar e substitui vírgula por ponto
    const limpo = str.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
    const num = parseFloat(limpo);
    if (isNaN(num)) return '0,00';
    // Formata de volta para padrão PT-BR sem prefixo (ngx-mask cuida do R$)
    return num.toFixed(2).replace('.', ',');
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
    const body = err?.error;
    if (typeof body === 'string' && body.trim()) return body.trim();
    if (body?.message && typeof body.message === 'string') return body.message;
    if (body?.erro   && typeof body.erro   === 'string') return body.erro;
    return fallback;
  }

  /** Converte "1.234,56" (PT-BR) → 1234.56 (formato numérico para o backend) */
  private converterParaNumero(mascara: string | number | null | undefined): number {
    if (mascara == null || mascara === '') return 0;
    const str = String(mascara);
    // Remove pontos de milhar e substitui vírgula decimal por ponto
    const limpo = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(limpo) || 0;
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
    this.http.post(this.urlProdutos, this.montarPayload()).subscribe({
      next: () => {
        this.toast.sucesso('Produto registrado com sucesso.');
        this.router.navigate(['/principal/lista-produtos']);
      },
      error: (err) => {
        this.salvando = false;
        this.toast.erro(this.extrairMensagemErro(err));
      }
    });
  }

  private atualizarProduto(): void {
    this.http.put(`${this.urlProdutos}/${this.produtoParaEditar.codigo}`, this.montarPayload()).subscribe({
      next: () => {
        this.toast.sucesso('Produto atualizado com sucesso.');
        this.router.navigate(['/principal/lista-produtos']);
      },
      error: (err) => {
        this.salvando = false;
        this.toast.erro(this.extrairMensagemErro(err));
      }
    });
  }

  /** Normaliza o campo monetário ao sair: garante sempre 2 casas decimais */
  normalizarMoeda(controlName: string): void {
    const ctrl = this.form.get(controlName);
    if (!ctrl) return;
    let valor = String(ctrl.value ?? '').trim();
    if (!valor) {
      ctrl.setValue('0,00', { emitEvent: false });
      return;
    }
    if (!valor.includes(',')) {
      // sem vírgula: adiciona ,00
      ctrl.setValue(valor + ',00', { emitEvent: false });
    } else {
      // com vírgula: garante exatamente 2 casas decimais
      const [inteiro, decimais] = valor.split(',');
      ctrl.setValue(`${inteiro},${(decimais ?? '').padEnd(2, '0').substring(0, 2)}`, { emitEvent: false });
    }
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
}
