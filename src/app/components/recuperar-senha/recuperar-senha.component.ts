import { Component } from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatError, MatFormField, MatHint, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {NgOptimizedImage} from "@angular/common";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatIcon} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import { NgxMaskDirective} from 'ngx-mask';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
    imports: [
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
      NgOptimizedImage,
      MatButton,
      MatHint,
      NgxMaskDirective
    ],
  templateUrl: './recuperar-senha.component.html',
  styleUrl: './recuperar-senha.component.css'
})
export class RecuperarSenhaComponent {
  cpf: string = '';
  tokenId: string = '';
  recuperaSenhaForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
      Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).+$/)
    ]),
    retypePassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
      Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).+$/)
    ]),
    cpf: new FormControl(this.cpf, [
      Validators.required,
      Validators.minLength(11),
      Validators.maxLength(11),
      Validators.pattern(/^\d{11}$/)
    ]),
    tokenId: new FormControl(this.tokenId, [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(8),
      Validators.pattern(/^\d{8}$/)
    ])
  });

  constructor(private snackBar: MatSnackBar,
              private route: ActivatedRoute) {}


  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['cpf']) {
        this.recuperaSenhaForm.get('cpf')?.setValue(params['cpf']);
        this.recuperaSenhaForm.get('cpf')?.disable();
      }
      if (params['email']) {
        this.recuperaSenhaForm.get('email')?.setValue(params['email']);
        this.recuperaSenhaForm.get('email')?.disable();
      }
    });
  }

  validatePasswords(): boolean {
    const password = this.recuperaSenhaForm.get('password')?.value;
    const retypePassword = this.recuperaSenhaForm.get('retypePassword')?.value;
    return password === retypePassword;
  }

  validateCPF(): boolean {
    const cpf = this.recuperaSenhaForm.get('cpf')?.value;
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

  get email() {
    return this.recuperaSenhaForm.get('email');
  }

  get password() {
    return this.recuperaSenhaForm.get('password');
  }

  get retypePassword() {
    return this.recuperaSenhaForm.get('retypePassword');
  }

  onSubmit() {
    if (this.recuperaSenhaForm.valid) {
      this.snackBar.open('Recuperação de senha realizado com sucesso!', 'Fechar', {
        duration: 3000
      });
      // Aqui você implementaria a lógica real de login
    } else {
      this.snackBar.open('Por favor, corrija os erros no formulário.', 'Fechar', {
        duration: 3000
      });
    }
  }
}
