import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatError, MatFormField, MatHint, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {MatSnackBar} from "@angular/material/snack-bar";
import {NgOptimizedImage} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {RouterLink, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {JwtService} from "../../services/jwt.service";
import {PaginaErroService} from "../../services/pagina-erro.service";
import {Usuario} from '../../model/usuario.model';
import {HttpErrorResponse} from '@angular/common/http';
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
    MatHint,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  usuario! :Usuario;
  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
      Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).+$/)
    ])
  });


  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService,
    private jwtService: JwtService,
    private paginaErroService: PaginaErroService
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

  private redirecionarParaPaginaErro(errorMessage: string): void {
    const mensagemLimpa = this.limparMensagemBloqueio(errorMessage);
    this.paginaErroService.definirErro(mensagemLimpa, '/');
    this.router.navigate(['/erro']);
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

              if (jwtMessage && this.isCodigoBloqueio(jwtMessage)) {
                console.log('✅ Redirecionando para página de erro (NEXT)');
                this.redirecionarParaPaginaErro(jwtMessage);
                return;
              }

              // Armazenar o token JWT
              if (token.jwt) {
                this.jwtService.setToken(token.jwt);
              }
              this.snackBar.open('Login realizado com sucesso!', 'Fechar', {
                duration: 3000
              });
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

              if (this.isCodigoBloqueio(errorMessage)) {
                console.log('✅ Redirecionando para página de erro (ERROR)');
                this.redirecionarParaPaginaErro(errorMessage);
              } else {
                console.log('❌ Mostrando snackbar');
                // Caso contrario, mostra o snackbar
                this.snackBar.open(errorMessage, 'Fechar', {
                  duration: 5000
                });
              }
            }
          });
      } else {
        console.warn('Email ou senha vazios');
      }
    } else {
      console.warn('Formulário inválido');
      this.snackBar.open('Por favor, corrija os erros no formulário.', 'Fechar', {
        duration: 3000
      });
    }
  }
}
