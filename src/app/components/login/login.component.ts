import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatError, MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {NgOptimizedImage} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {RouterLink, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {JwtService} from "../../services/jwt.service";
import {Usuario} from '../../model/usuario.model';
import {HttpErrorResponse} from '@angular/common/http';
import {ToastService} from '../../services/toast.service';
@Component({
  selector: 'app-login',
  imports: [
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
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  usuario! :Usuario;

  readonly senhaErroPattern = 'Senha deve iniciar com letra ou número, conter maiúscula, minúscula, número e caractere especial (!@#$%^&*()-_+=[]{};:,.<>?/), sem espaços';
  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
      Validators.pattern(/^(?=[a-zA-Z0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()\-_+=\[\]{};:,.<>?\/])[a-zA-Z0-9!@#$%^&*()\-_+=\[\]{};:,.<>?\/]+$/)
    ])
  });


  constructor(
    private toast: ToastService,
    private router: Router,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {
    this.usuario = new Usuario();
  }



  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  private isCodigoBloqueio(message: string): boolean {
    const normalizedMessage = message.trim().toUpperCase();
    return normalizedMessage.startsWith('BLQADM') || normalizedMessage.startsWith('BLQSNF');
  }

  private isPrimeiroAcesso(message: string): boolean {
    return message.trim().toUpperCase().startsWith('BLQPAC');
  }

  private limparMensagemBloqueio(message: string): string {
    const withoutCode = message.substring(6).trim().replace(/^[-\u2013\u2014]\s*/, '');
    return withoutCode || 'Seu acesso foi bloqueado. Entre em contato com o administrador.';
  }

  private extrairMensagemErro(erro: HttpErrorResponse): string {
    if (typeof erro?.error === 'string') {
      return erro.error;
    }

    return erro?.error?.jwt || erro?.error?.message || 'Erro ao realizar login. Verifique suas credenciais.';
  }

  private mostrarErroBloqueio(message: string): void {
    const mensagemLimpa = this.limparMensagemBloqueio(message);
    this.toast.erro(mensagemLimpa);
  }

  onSubmit() {
    console.log('=== FORM SUBMIT ===');
    console.log('Formulário válido?', this.loginForm.valid);
    console.log('Valores do formulário:', this.loginForm.value);

    if (this.loginForm.valid) {
      const emailValue = this.loginForm.get('email')?.value;
      const passwordValue = this.loginForm.get('password')?.value;

      console.log('Email:', emailValue);
      console.log('Senha:', passwordValue ? '***' : 'vazia');

      if (emailValue && passwordValue) {
        this.usuario.login = emailValue;
        this.usuario.senha = passwordValue;

        console.log('Chamando authService.login()...');

        this.authService.login(this.usuario).subscribe(
          {
            next: (token)=>{
              console.log('=== FLUXO NEXT (SUCESSO) ===');
              console.log('Token completo:', JSON.stringify(token));
              console.log('token.jwt:', token?.jwt);

              const jwtMessage = token?.jwt?.trim() || '';
              console.log('jwtMessage após trim:', jwtMessage);
              console.log('É código de bloqueio?', this.isCodigoBloqueio(jwtMessage));

              if (jwtMessage && this.isPrimeiroAcesso(jwtMessage)) {
                console.log('✅ Redirecionando para Primeiro Acesso (NEXT)');
                this.router.navigate(['/solicitar-token'], {
                  queryParams: { email: btoa(emailValue), primeiroAcesso: true }
                });
                return;
              }

              if (jwtMessage && this.isCodigoBloqueio(jwtMessage)) {
                console.log('✅ Exibindo toast de bloqueio (NEXT)');
                this.mostrarErroBloqueio(jwtMessage);
                return;
              }

              // Armazenar o token JWT
              if (token.jwt) {
                this.jwtService.setToken(token.jwt);
              }
              this.toast.sucesso('Login realizado com sucesso!');
              this.router.navigate(['/principal/lista-usuarios']);
            },
            error: (erro:HttpErrorResponse)=>{
              console.log('=== FLUXO ERROR ===');
              console.error('Erro completo:', erro);
              console.log('erro.error:', erro?.error);
              console.log('Tipo de erro.error:', typeof erro?.error);

              const errorMessage = this.extrairMensagemErro(erro);
              console.log('errorMessage extraída:', errorMessage);
              console.log('É código de bloqueio?', this.isCodigoBloqueio(errorMessage));

              if (this.isPrimeiroAcesso(errorMessage)) {
                console.log('✅ Redirecionando para Primeiro Acesso (ERROR)');
                this.router.navigate(['/solicitar-token'], {
                  queryParams: { email: btoa(emailValue), primeiroAcesso: true }
                });
                return;
              }

              if (this.isCodigoBloqueio(errorMessage)) {
                console.log('✅ Exibindo toast de bloqueio (ERROR)');
                this.mostrarErroBloqueio(errorMessage);
              } else {
                console.log('❌ Mostrando toast de erro');
                this.toast.erro(errorMessage);
              }
            }
          });
      } else {
        console.warn('Email ou senha vazios');
      }
    } else {
      console.warn('Formulário inválido');
      this.toast.aviso('Por favor, corrija os erros no formulário.');
    }
  }
}
