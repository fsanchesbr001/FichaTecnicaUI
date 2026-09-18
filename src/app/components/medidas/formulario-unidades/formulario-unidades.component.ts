import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { Router, Navigation } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../services/toast.service';
import { ApiErrorService } from '../../../services/api-error.service';

@Component({
  selector: 'app-formulario-unidades',
  standalone: true,
  imports: [
    FormsModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    ReactiveFormsModule,
    MatButton,
    MatError,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatSuffix
  ],
  templateUrl: './formulario-unidades.component.html',
  styleUrl: './formulario-unidades.component.css'
})
export class FormularioUnidadesComponent implements OnInit {
  form!: FormGroup;
  salvando = false;
  protected medidaParaEditar: any = null;

  private readonly urlUnidades = `${environment.API}ficha-tecnica/unidades-medida`;
  private readonly urlGerarPdfDetalheBase = `${environment.API}ficha-tecnica/unidades-medida/relatorios`;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
    private apiErrorService: ApiErrorService,
  ) {
    const nav: Navigation | null = this.router.getCurrentNavigation();
    this.medidaParaEditar = nav?.extras?.state?.['medida'] ?? null;

    this.form = this.fb.group({
      nome: ['', Validators.required],
      sigla: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.medidaParaEditar) {
      this.form.patchValue({
        nome: this.medidaParaEditar.nome ?? '',
        sigla: this.medidaParaEditar.sigla ?? '',
      });
    }
  }

  onSalvar(): void {
    if (this.form.invalid) {
      this.toast.aviso('Por favor, corrija os erros no formulário.');
      return;
    }

    this.salvando = true;

    if (this.medidaParaEditar) {
      this.atualizarUnidade();
    } else {
      this.registrarUnidade();
    }
  }

  private extrairMensagemErro(err: any, fallback = 'ERRO DE CHAMADA HTTP'): string {
    return this.apiErrorService.extrairMensagem(err, fallback);
  }

  private registrarUnidade(): void {
    const payload = this.form.getRawValue();
    this.http.post(this.urlUnidades, payload).subscribe({
      next: () => {
        this.toast.sucesso('Unidade de medida registrada com sucesso.');
        this.router.navigate(['/principal/lista-medidas']);
      },
      error: (err) => {
        this.salvando = false;
        this.toast.erro(this.extrairMensagemErro(err));
      }
    });
  }

  private atualizarUnidade(): void {
    const payload = this.form.getRawValue();
    this.http.put(`${this.urlUnidades}/${this.medidaParaEditar.codigo}`, payload).subscribe({
      next: () => {
        this.toast.sucesso('Unidade de medida atualizada com sucesso.');
        this.router.navigate(['/principal/lista-medidas']);
      },
      error: (err) => {
        this.salvando = false;
        this.toast.erro(this.extrairMensagemErro(err));
      }
    });
  }

  onCancelar(): void {
    this.router.navigate(['/principal/lista-medidas']);
  }

  onImprimir(): void {
    if (!this.medidaParaEditar) return;

    const siglaBruta = this.form.get('sigla')?.value ?? this.medidaParaEditar.sigla;
    const sigla = typeof siglaBruta === 'string' ? siglaBruta.trim() : '';
    if (!sigla) {
      this.toast.aviso('Sigla da unidade de medida não informada.');
      return;
    }

    const now = new Date();
    const aaaa = now.getFullYear().toString();
    const mm   = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd   = now.getDate().toString().padStart(2, '0');
    const hh   = now.getHours().toString().padStart(2, '0');
    const min  = now.getMinutes().toString().padStart(2, '0');
    const ss   = now.getSeconds().toString().padStart(2, '0');
    const filename = `detalhe-medida-${aaaa}${mm}${dd}_${hh}${min}${ss}.pdf`;
    const siglaCodificada = encodeURIComponent(sigla);
    const endpoint = `${this.urlGerarPdfDetalheBase}/${siglaCodificada}/detalhe`;

    this.http.get(endpoint, { responseType: 'blob' }).subscribe({
      next: (blob) => this.baixarArquivo(blob, filename),
      error: (err) => {
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
}
