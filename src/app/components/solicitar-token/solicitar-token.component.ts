import { Component } from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {NgOptimizedImage} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatError, MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {NgxMaskDirective} from 'ngx-mask';
import {MatButton} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitar-token',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgOptimizedImage,
    NgxMaskDirective,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatError,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatSuffix,
    MatButton
  ],
  templateUrl: './solicitar-token.component.html',
  styleUrl: './solicitar-token.component.css'
})
export class SolicitarTokenComponent {
  cpf: string = '';
  email: string = '';
  solicitarTokenForm = new FormGroup({
    cpf: new FormControl(this.cpf, [
      Validators.required,
      Validators.minLength(11),
      Validators.maxLength(11),
      Validators.pattern(/^\d{11}$/)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ])
  });

  isTokenButtonEnabled: boolean = false;


  constructor(private SnackBar: MatSnackBar, private router: Router) {

  }

  validateCPF(): boolean {
    const cpf = this.solicitarTokenForm.get('cpf')?.value;
    // Implementação simples de validação de CPF
    if (!cpf || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let sum = 0, remainder;
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf[i - 1]) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf[9])) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf[i - 1]) * (12 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cpf[10]);
  }

  onSubmit() {
    if (this.solicitarTokenForm.valid) {
      const cpf = this.solicitarTokenForm.get('cpf')?.value;
      if (this.validateCPF()) {
        this.SnackBar.open('Token solicitado com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.isTokenButtonEnabled = true;
      } else {
        this.SnackBar.open('CPF inválido!', 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    }
  }

  redirectToRecuperarSenha() {
    const cpf = this.solicitarTokenForm.get('cpf')?.value;
    const  email = this.solicitarTokenForm.get('email')?.value;
    this.router.navigate(['/recuperar-senha'], { queryParams: { cpf,email } });
  }

}
