import { Component, Input, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatError, MatFormField,  MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {NgxMaskDirective} from 'ngx-mask';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MAT_DATE_LOCALE, provideNativeDateAdapter} from '@angular/material/core';
import {MAT_DATE_FORMATS} from '@angular/material/core';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import {validateCPF} from '../../../validators/cpf.validator';

registerLocaleData(localePt);


export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'dd/MM/yyyy',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MM/yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MM/yyyy',
    yearA11yLabel: 'yyyy',
  },
};


@Component({
  selector: 'app-formulario-usuarios',
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
    MatFormField,
    MatFormField,
    MatIcon,
    MatLabel,
    ReactiveFormsModule,
    MatInput,
    MatSuffix,
    MatButton,
    MatDatepickerModule,
    MatOption,
    NgxMaskDirective,
    MatSlideToggle,
    MatSelect
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    provideNativeDateAdapter()
  ],
  templateUrl: './formulario-usuarios.component.html',
  styleUrls: ['./formulario-usuarios.component.css']
})

export class FormularioUsuariosComponent implements OnInit {
  @Input() usuario: any;
  form!: FormGroup;
  roles = ['ADMIN', 'USER'];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: [this.usuario?.nome || '', Validators.required],
      email: [this.usuario?.email || '', [Validators.required, Validators.email]],
      cpf: [this.usuario?.cpf || '', [validateCPF,Validators.required, Validators.minLength(11),Validators.maxLength(11),Validators.pattern(/^\d{11}$/)]],
      role: [this.usuario?.role || '', Validators.required],
      dataExpiracao: [{ value: this.usuario?.dataExpiracao || new Date(), disabled: true }],
      tentativas: [{ value: this.usuario?.tentativas ?? 5, disabled: true }, [Validators.min(0), Validators.max(5)]],
      primeiroAcesso: [this.usuario?.primeiroAcesso || false],
      bloqueioAdm: [this.usuario?.bloqueioAdm || false],
      bloqueioTentativas: [this.usuario?.bloqueioTentativas || false],
      bloqueioExpiracao: [this.usuario?.bloqueioExpiracao || false]
    });
  }

  salvar() {
    if (this.form.valid) {
      // lógica de salvar
    }
  }

  cancelar() {
    // lógica de cancelar
  }

  imprimir() {
    // lógica de imprimir
  }
}
