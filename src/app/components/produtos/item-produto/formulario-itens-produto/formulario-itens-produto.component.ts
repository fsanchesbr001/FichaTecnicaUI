import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { environment } from '../../../../../../environments/environment';
import { ToastService } from '../../../../services/toast.service';
import { ApiErrorService } from '../../../../services/api-error.service';

export interface ItemEstoque {
  codigo: number;
  nome: string;
}

export interface UnidadeMedidaModal {
  codigo: number;
  nome: string;
  sigla: string;
}

export interface DialogItensProdutoData {
  codigoProduto: number;
  nomeProduto: string;
}

@Component({
  selector: 'app-formulario-itens-produto',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    NgxMaskDirective,
  ],
  providers: [provideNgxMask()],
  templateUrl: './formulario-itens-produto.component.html',
  styleUrl: './formulario-itens-produto.component.css'
})
export class FormularioItensProdutoComponent implements OnInit {

  form!: FormGroup;
  salvando = false;
  itensEstoque: ItemEstoque[] = [];
  unidades: UnidadeMedidaModal[] = [];

  private readonly urlItens    = `${environment.API}ficha-tecnica/itens`;
  private readonly urlUnidades = `${environment.API}ficha-tecnica/unidades-medida`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toast: ToastService,
    private apiErrorService: ApiErrorService,
    public dialogRef: MatDialogRef<FormularioItensProdutoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogItensProdutoData,
  ) {
    this.form = this.fb.group({
      produto:    [{ value: data.nomeProduto, disabled: true }],
      item:       ['', Validators.required],
      quantidade: ['', [Validators.required]],
      medida:     ['', Validators.required],
      valor:      [{ value: '0,00', disabled: true }],
    });
  }

  ngOnInit(): void {
    this.carregarItensEstoque();
    this.carregarUnidades();
  }

  carregarItensEstoque(): void {
    this.http.get<ItemEstoque[]>(this.urlItens).subscribe({
      next: (dados) => this.itensEstoque = dados ?? [],
      error: () => this.toast.erro('ERRO AO CARREGAR ITENS'),
    });
  }

  carregarUnidades(): void {
    this.http.get<UnidadeMedidaModal[]>(this.urlUnidades).subscribe({
      next: (dados) => this.unidades = dados ?? [],
      error: () => this.toast.erro('ERRO AO CARREGAR UNIDADES DE MEDIDA'),
    });
  }

  private converterParaNumero(mascara: string | null | undefined): number {
    if (!mascara) return 0;
    const limpo = String(mascara).replace(/\./g, '').replace(',', '.');
    return parseFloat(limpo) || 0;
  }

  normalizarInteiro(controlName: string): void {
    const ctrl = this.form.get(controlName);
    if (!ctrl) return;

    const apenasDigitos = String(ctrl.value ?? '').replace(/\D/g, '');
    const numero = parseInt(apenasDigitos || '0', 10);
    ctrl.setValue(new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(numero), { emitEvent: false });
  }

  onAdicionar(): void {
    if (this.form.invalid) {
      this.toast.aviso('Por favor, corrija os erros no formulário.');
      return;
    }
    this.salvando = true;
    const raw = this.form.getRawValue();
    const payload = [
      {
        cdItem: raw.item,
        cdProduto: this.data.codigoProduto,
        qtdItem: this.converterParaNumero(raw.quantidade),
        cdUnidadeMedida: raw.medida,
        vlrItem: 0.00,
      }
    ];

    const url = `${environment.API}ficha-tecnica/produtos/${this.data.codigoProduto}/itens`;
    this.http.post(url, payload).subscribe({
      next: () => {
        this.toast.sucesso('Item adicionado ao produto com sucesso.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.salvando = false;
        this.toast.erro(this.apiErrorService.extrairMensagem(err, 'Erro ao adicionar item ao produto.'));
      }
    });
  }

  onCancelar(): void {
    this.dialogRef.close(false);
  }
}
