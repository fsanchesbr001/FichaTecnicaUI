import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatOption, MatSelect } from '@angular/material/select';
import { Router, Navigation } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../services/toast.service';
import { ApiErrorService } from '../../../services/api-error.service';

export interface UnidadeMedida {
  codigo: number;
  nome: string;
  sigla: string;
}

interface ConversaoRequest {
  unidadeDe: number;
  unidadePara: number;
  operacao: string;
  valor: number;
}

const fatorPositivoPtBrValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = String(control.value ?? '').trim();
  if (!valor) return null;

  const numero = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(numero) && numero > 0 ? null : { min: true };
};

@Component({
  selector: 'app-formulario-conversoes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardTitle,
    MatFormField,
    MatError,
    MatIcon,
    MatLabel,
    ReactiveFormsModule,
    MatInput,
    MatSuffix,
    MatButton,
    MatSelect,
    MatOption,
  ],
  templateUrl: './formulario-conversoes.component.html',
  styleUrl: './formulario-conversoes.component.css'
})
export class FormularioConversoesComponent implements OnInit {

  form!: FormGroup;
  salvando = false;
  protected conversaoParaEditar: any = null;

  unidades: UnidadeMedida[] = [];
  operacoes = [
    { label: 'Multiplica', value: 'MULTIPLICA' },
    { label: 'Divide',     value: 'DIVIDE'     },
  ];

  private readonly urlConversoes  = `${environment.API}ficha-tecnica/conversoes`;
  private readonly urlUnidades    = `${environment.API}ficha-tecnica/unidades-medida`;
  private readonly urlGerarPdf    = `${environment.API}ficha-tecnica/conversoes/gerar-pdf-detalhe`;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
    private apiErrorService: ApiErrorService,
  ) {
    const nav: Navigation | null = this.router.getCurrentNavigation();
    this.conversaoParaEditar = nav?.extras?.state?.['conversao'] ?? null;

    this.form = this.fb.group({
      unidadeDe:   ['', Validators.required],
      unidadePara: ['', Validators.required],
      operacao:    [this.operacoes[0].value, Validators.required],
      valor:       ['', [Validators.required, fatorPositivoPtBrValidator]],
    });
  }

  ngOnInit(): void {
    this.carregarUnidades();
  }

  carregarUnidades(): void {
    this.http.get<UnidadeMedida[]>(this.urlUnidades).subscribe({
      next: (dados) => {
        this.unidades = dados ?? [];
        if (this.conversaoParaEditar) {
          setTimeout(() => this.preencherFormulario(this.conversaoParaEditar));
        }
      },
      error: () => {
        this.unidades = [];
        this.toast.erro('ERRO AO CARREGAR UNIDADES DE MEDIDA');
        if (this.conversaoParaEditar) {
          setTimeout(() => this.preencherFormulario(this.conversaoParaEditar));
        }
      }
    });
  }

  private preencherFormulario(c: any): void {
    // ConversaoRelatorioDTO retorna nomes das unidades; o select precisa do código (ID)
    const unidadeDeId   = this.unidades.find(u => u.nome === c.unidadeDe)?.codigo  ?? null;
    const unidadeParaId = this.unidades.find(u => u.nome === c.unidadePara)?.codigo ?? null;

    this.form.patchValue({
      unidadeDe:   unidadeDeId,
      unidadePara: unidadeParaId,
      operacao:    c.operacao ?? '',
      valor:       this.formatarNumeroParaExibicao(c.valor),
    });
  }

  private converterParaNumero(valor: string | number | null | undefined): number {
    if (valor == null || valor === '') return 0;
    const str = String(valor).replace(/\./g, '').replace(',', '.');
    return parseFloat(str) || 0;
  }

  private formatarNumeroParaExibicao(valor: string | number | null | undefined): string {
    if (valor == null || valor === '') return '';
    const numero = typeof valor === 'number' ? valor : this.converterParaNumero(valor);
    if (!Number.isFinite(numero)) return '';
    const formatado = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    }).format(numero);
    return formatado;
  }

  onFatorInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;

    let texto = (input.value ?? '').replace(/[^\d,]/g, '');
    const primeiraVirgula = texto.indexOf(',');
    if (primeiraVirgula >= 0) {
      texto = `${texto.substring(0, primeiraVirgula + 1)}${texto.substring(primeiraVirgula + 1).replace(/,/g, '')}`;
    }

    const partes = texto.split(',');
    const inteiro = (partes[0] ?? '').replace(/^0+(?=\d)/, '');
    const inteiroComMilhar = (inteiro || '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimal = (partes[1] ?? '').replace(/\D/g, '').substring(0, 6);

    const valorFormatado = decimal ? `${inteiroComMilhar},${decimal}` : inteiroComMilhar;
    input.value = valorFormatado;
    this.form.get('valor')?.setValue(valorFormatado, { emitEvent: false });
  }

  normalizarFator(): void {
    const ctrl = this.form.get('valor');
    if (!ctrl) return;

    const valorAtual = String(ctrl.value ?? '').trim();
    if (!valorAtual) {
      ctrl.setValue('', { emitEvent: false });
      return;
    }

    const numero = this.converterParaNumero(ctrl.value);
    const formatado = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    }).format(numero);

    ctrl.setValue(formatado, { emitEvent: false });
  }

  private extrairMensagemErro(err: any, fallback = 'ERRO DE CHAMADA HTTP'): string {
    return this.apiErrorService.extrairMensagem(err, fallback);
  }

  onSalvar(): void {
    if (this.form.invalid) {
      this.toast.aviso('Por favor, corrija os erros no formulário.');
      return;
    }
    this.salvando = true;
    if (this.conversaoParaEditar) {
      this.atualizarConversao();
    } else {
      this.registrarConversao();
    }
  }

  private registrarConversao(): void {
    const payload = this.montarPayload();
    this.http.post(this.urlConversoes, payload).subscribe({
      next: () => {
        this.toast.sucesso('Conversão registrada com sucesso.');
        this.router.navigate(['/principal/lista-conversoes']);
      },
      error: (err) => {
        this.salvando = false;
        this.toast.erro(this.extrairMensagemErro(err));
      }
    });
  }

  private atualizarConversao(): void {
    const payload = this.montarPayload();
    this.http.put(`${this.urlConversoes}/${this.conversaoParaEditar.codigo}`, payload).subscribe({
      next: () => {
        this.toast.sucesso('Conversão atualizada com sucesso.');
        this.router.navigate(['/principal/lista-conversoes']);
      },
      error: (err) => {
        this.salvando = false;
        this.toast.erro(this.extrairMensagemErro(err));
      }
    });
  }

  private montarPayload(): ConversaoRequest {
    const raw = this.form.getRawValue();
    return {
      unidadeDe: Number(raw.unidadeDe),
      unidadePara: Number(raw.unidadePara),
      operacao: raw.operacao,
      valor: this.converterParaNumero(raw.valor)
    };
  }

  onCancelar(): void {
    this.router.navigate(['/principal/lista-conversoes']);
  }

  onImprimir(): void {
    if (!this.conversaoParaEditar) return;

    this.http.get(`${this.urlGerarPdf}/${this.conversaoParaEditar.codigo}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const now  = new Date();
        const aaaa = now.getFullYear().toString();
        const mm   = (now.getMonth() + 1).toString().padStart(2, '0');
        const dd   = now.getDate().toString().padStart(2, '0');
        const hh   = now.getHours().toString().padStart(2, '0');
        const min  = now.getMinutes().toString().padStart(2, '0');
        const ss   = now.getSeconds().toString().padStart(2, '0');
        const filename = `detalhe-conversao-${aaaa}${mm}${dd}_${hh}${min}${ss}.pdf`;

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
