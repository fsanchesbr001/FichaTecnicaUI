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
import {UsuarioLogin} from '../../model/usuario.model';
import {HttpErrorResponse} from '@angular/common/http';
import {ToastService} from '../../services/toast.service';
import {ApiErrorService} from '../../services/api-error.service';
import {TokenJwt} from '../../model/tokenJwt.model';
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
  usuario!: UsuarioLogin;

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
    private apiErrorService: ApiErrorService,
  ) {
    this.usuario = { login: '', senha: '' };
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
    return this.apiErrorService.extrairMensagem(erro, 'Erro ao realizar login. Verifique suas credenciais.');
  }

  private obterTokenRetorno(token: TokenJwt | null | undefined): string {
    return token?.token?.trim() || token?.jwt?.trim() || '';
  }

  private mostrarErroBloqueio(message: string): void {
    const mensagemLimpa = this.limparMensagemBloqueio(message);
    this.toast.erro(mensagemLimpa);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const emailValue = this.loginForm.get('email')?.value;
      const passwordValue = this.loginForm.get('password')?.value;

      if (emailValue && passwordValue) {
        this.usuario.login = emailValue;
        this.usuario.senha = passwordValue;

        this.authService.login(this.usuario).subscribe(
          {
            next: (token)=>{
              const jwtMessage = this.obterTokenRetorno(token);

              if (jwtMessage && this.isPrimeiroAcesso(jwtMessage)) {
                this.router.navigate(['/solicitar-token'], {
                  queryParams: { email: btoa(emailValue), primeiroAcesso: true }
                });
                return;
              }

              if (jwtMessage && this.isCodigoBloqueio(jwtMessage)) {
                this.mostrarErroBloqueio(jwtMessage);
                return;
              }

              if (jwtMessage) {
                this.jwtService.setToken(jwtMessage);
              }
              this.toast.sucesso('Login realizado com sucesso!');
              this.router.navigate(['/principal/lista-produtos']);
            },
            error: (erro:HttpErrorResponse)=>{
              const errorMessage = this.extrairMensagemErro(erro);

              if (this.isPrimeiroAcesso(errorMessage)) {
                this.router.navigate(['/solicitar-token'], {
                  queryParams: { email: btoa(emailValue), primeiroAcesso: true }
                });
                return;
              }

              if (this.isCodigoBloqueio(errorMessage)) {
                this.mostrarErroBloqueio(errorMessage);
              } else {
                this.toast.erro(errorMessage);
              }
            }
          });
      }
    } else {
      this.toast.aviso('Por favor, corrija os erros no formulário.');
    }
  }
}
