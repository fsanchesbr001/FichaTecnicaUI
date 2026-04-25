import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { GraficoPrecosItemComponent } from '../grafico-precos-item/grafico-precos-item.component';

export interface UnidadeMedida {
  codigo: number;
  nome: string;
  sigla: string;
}

@Component({
  selector: 'app-formulario-item',
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
    GraficoPrecosItemComponent,
  ],
  templateUrl: './formulario-item.component.html',
  styleUrl: './formulario-item.component.css'
})
export class FormularioItemComponent implements OnInit {

  @ViewChild(GraficoPrecosItemComponent) graficoCmp?: GraficoPrecosItemComponent;

  form!: FormGroup;
  salvando = false;
  protected itemParaEditar: any = null;

  unidades: UnidadeMedida[] = [];

  private readonly urlItens    = `${environment.API}ficha-tecnica/itens`;
  private readonly urlUnidades = `${environment.API}ficha-tecnica/unidades-medida`;
  private readonly urlGerarPdf = `${environment.API}ficha-tecnica/itens/gerar-pdf-detalhe`;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {
    const nav: Navigation | null = this.router.getCurrentNavigation();
    this.itemParaEditar = nav?.extras?.state?.['item'] ?? null;

    this.form = this.fb.group({
      nome:    ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      unidade: ['', Validators.required],
      valor:   ['', [Validators.required, Validators.min(0.0001)]],
    });
  }

  ngOnInit(): void {
    this.carregarUnidades();
  }

  carregarUnidades(): void {
    this.http.get<UnidadeMedida[]>(this.urlUnidades).subscribe({
      next: (dados) => {
        this.unidades = dados ?? [];
        if (this.itemParaEditar) {
          setTimeout(() => this.preencherFormulario(this.itemParaEditar));
        }
      },
      error: () => {
        this.unidades = [];
        this.toast.erro('ERRO AO CARREGAR UNIDADES DE MEDIDA');
        if (this.itemParaEditar) {
          setTimeout(() => this.preencherFormulario(this.itemParaEditar));
        }
      }
    });
  }

  private preencherFormulario(item: any): void {
    const unidadeId = item.unidadeMedida?.codigo
      ?? this.unidades.find(u => u.nome === item.unidade || u.codigo === item.unidade)?.codigo
      ?? null;

    // valor vem como string formatada "R$ 6,50" — extrai o número puro
    let valorNumerico: number | string = item.valor ?? '';
    if (typeof valorNumerico === 'string') {
      valorNumerico = parseFloat(
        valorNumerico.replace(/[R$\s.]/g, '').replace(',', '.')
      );
      if (isNaN(valorNumerico as number)) valorNumerico = '';
    }

    this.form.patchValue({
      nome:    item.nome    ?? '',
      unidade: unidadeId,
      valor:   valorNumerico,
    });
  }

  private extrairMensagemErro(err: any, fallback = 'ERRO DE CHAMADA HTTP'): string {
    const body = err?.error;
    if (typeof body === 'string' && body.trim()) return body.trim();
    if (body?.message && typeof body.message === 'string') return body.message;
    if (body?.erro   && typeof body.erro   === 'string') return body.erro;
    return fallback;
  }

  onSalvar(): void {
    if (this.form.invalid) {
      this.toast.aviso('Por favor, corrija os erros no formulário.');
      return;
    }
    this.salvando = true;
    if (this.itemParaEditar) {
      this.atualizarItem();
    } else {
      this.registrarItem();
    }
  }

  private registrarItem(): void {
    const raw = this.form.getRawValue();
    const payload = { nome: raw.nome, unidadeMedida: { codigo: raw.unidade }, valor: raw.valor };
    this.http.post(this.urlItens, payload).subscribe({
      next: () => {
        this.toast.sucesso('Item registrado com sucesso.');
        this.router.navigate(['/principal/lista-item']);
      },
      error: (err) => {
        this.salvando = false;
        this.toast.erro(this.extrairMensagemErro(err));
      }
    });
  }

  private atualizarItem(): void {
    const raw = this.form.getRawValue();
    const payload = { nome: raw.nome, unidadeMedida: { codigo: raw.unidade }, valor: raw.valor };
    this.http.put(`${this.urlItens}/${this.itemParaEditar.codigo}`, payload).subscribe({
      next: () => {
        this.toast.sucesso('Item atualizado com sucesso.');
        this.router.navigate(['/principal/lista-item']);
      },
      error: (err) => {
        this.salvando = false;
        this.toast.erro(this.extrairMensagemErro(err));
      }
    });
  }

  onCancelar(): void {
    this.router.navigate(['/principal/lista-item']);
  }

  onImprimir(): void {
    if (!this.itemParaEditar) return;

    this.http.get(`${this.urlGerarPdf}/${this.itemParaEditar.codigo}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const now    = new Date();
        const stamp  = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_`
                     + `${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
        const filename = `detalhe-item-${stamp}.pdf`;

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
