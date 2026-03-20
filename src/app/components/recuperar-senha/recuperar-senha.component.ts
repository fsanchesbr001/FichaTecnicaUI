import { Component, OnInit } from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatError, MatFormField, MatHint, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {NgOptimizedImage} from "@angular/common";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatIcon} from '@angular/material/icon';
import { NgxMaskDirective} from 'ngx-mask';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {validateCPF} from '../../validators/cpf.validator';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { JwtService } from '../../services/jwt.service';
import { HttpErrorResponse } from '@angular/common/http';

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
export class RecuperarSenhaComponent implements OnInit {
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
      Validators.required,validateCPF,
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

  isSalvarDisabled: boolean = false;

  constructor(private toast: ToastService,
              private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              private jwtService: JwtService) {}

  ngOnInit(): void {
    const emailParam = this.route.snapshot.queryParamMap.get('email');
    if (emailParam) {
      this.recuperaSenhaForm.get('email')?.setValue(emailParam);
      this.recuperaSenhaForm.get('email')?.disable();
    }
  }

  validatePasswords(): boolean {
    const password = this.recuperaSenhaForm.get('password')?.value;
    const retypePassword = this.recuperaSenhaForm.get('retypePassword')?.value;
    return password === retypePassword;
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
    if (!this.recuperaSenhaForm.valid) {
      this.toast.aviso('Por favor, corrija os erros no formulário.');
      return;
    }

    if (!this.validatePasswords()) {
      this.toast.aviso('As senhas não coincidem.');
      return;
    }

    this.isSalvarDisabled = true;

    const raw = this.recuperaSenhaForm.getRawValue();

    // CPF: ngx-mask armazena somente dígitos
    const cpfDigits = (raw.cpf ?? '').replace(/\D/g, '');
    const tokenDigits = (raw.tokenId ?? '').replace(/\D/g, '');

    // Senha convertida em Base64
    const senhaBase64 = btoa(raw.password ?? '');
    const confirmacaoBase64 = btoa(raw.retypePassword ?? '');

    const payload = {
      email: raw.email ?? '',
      cpf: cpfDigits,
      tokenSeguranca: tokenDigits,
      senha: senhaBase64,
      confirmacaoSenha: confirmacaoBase64
    };

    this.authService.trocarSenha(payload).subscribe({
      next: () => {
        this.toast.sucesso('Senha atualizada com sucesso!');
        this.realizarLogoutERedirecionar();
      },
      error: (erro: HttpErrorResponse) => {
        const mensagem = erro?.error?.message || 'Erro ao atualizar a senha. Tente novamente.';
        this.toast.erro(mensagem);
        this.realizarLogoutERedirecionar();
      }
    });
  }

  private realizarLogoutERedirecionar(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.jwtService.removeToken();
        this.router.navigate(['']);
      },
      error: () => {
        // Mesmo em caso de falha no logout, remove o token local e redireciona
        this.jwtService.removeToken();
        this.router.navigate(['']);
      }
    });
  }
}
