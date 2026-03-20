import { Component, OnInit } from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {NgOptimizedImage} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatError, MatFormField,  MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {JwtService} from '../../services/jwt.service';
import {ToastService} from '../../services/toast.service';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-solicitar-token',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgOptimizedImage,
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
export class SolicitarTokenComponent implements OnInit {
  solicitarTokenForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ])
  });

  isTokenButtonEnabled: boolean = false;
  isSolicitarDisabled: boolean = false;
  /** Indica que o componente foi aberto via fluxo de Primeiro Acesso */
  primeiroAcessoEmail: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private jwtService: JwtService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const emailParam = params['email'];
      const primeiroAcesso = params['primeiroAcesso'];

      if (emailParam && primeiroAcesso === 'true') {
        // Decodifica o email de Base64
        const emailDecodificado = atob(emailParam);
        this.primeiroAcessoEmail = true;
        this.solicitarTokenForm.get('email')!.setValue(emailDecodificado);
        this.solicitarTokenForm.get('email')!.disable();
      }
    });
  }

  onSubmit() {
    if (!this.solicitarTokenForm.valid && !this.primeiroAcessoEmail) {
      this.toast.aviso('Por favor, informe um e-mail válido.');
      return;
    }

    // getRawValue retorna o valor mesmo quando o campo está desabilitado
    const email = (this.solicitarTokenForm.getRawValue() as any).email as string;
    this.isSolicitarDisabled = true;

    // Passo 1: Iniciar recuperação de senha — obtém token temporário
    this.authService.iniciarRecuperacaoSenha(email).subscribe({
      next: (response) => {
        // Armazena o token temporário para que o interceptor injete nos próximos requests
        if (response?.jwt) {
          this.jwtService.setToken(response.jwt);
        }

        // Passo 2: Buscar dados do usuário (Authorization header injetado automaticamente)
        this.authService.buscarUsuarioPorEmail(email).subscribe({
          next: (usuario: any) => {
            // Verifica bloqueio administrativo
            if (usuario?.bloqueado_admin === true) {
              this.realizarLogoutERedirecionarComErro('Acesso bloqueado administrativamente. Entre em contato com o suporte.');
              return;
            }

            // Passo 3: Enviar e-mail com token (Authorization header injetado automaticamente)
            this.authService.enviarEmailRecuperacao(email).subscribe({
              next: () => {
                this.isTokenButtonEnabled = true;
                this.isSolicitarDisabled = false;
                this.toast.sucesso('Token enviado com sucesso! Verifique seu e-mail.');
              },
              error: (erro: HttpErrorResponse) => {
                this.isSolicitarDisabled = false;
                const mensagem = erro?.error?.message || 'Erro ao enviar e-mail. Tente novamente.';
                this.toast.erro(mensagem);
              }
            });
          },
          error: (erro: HttpErrorResponse) => {
            // Erro ao buscar usuário — mesmo procedimento do Sair
            const mensagem = erro?.error?.message || 'Usuário não encontrado ou erro ao validar dados.';
            this.realizarLogoutERedirecionarComErro(mensagem);
          }
        });
      },
      error: (erro: HttpErrorResponse) => {
        this.isSolicitarDisabled = false;
        const mensagem = erro?.error?.message || 'Erro ao iniciar recuperação de senha.';
        this.toast.erro(mensagem);
        this.router.navigate(['']);
      }
    });
  }

  /**
   * Executa logout, limpa token e redireciona para o login com mensagem de erro
   */
  private realizarLogoutERedirecionarComErro(mensagem: string): void {
    this.authService.logout().subscribe({
      next: () => {
        this.jwtService.removeToken();
        this.toast.erro(mensagem);
        this.router.navigate(['']);
      },
      error: () => {
        this.jwtService.removeToken();
        this.toast.erro(mensagem);
        this.router.navigate(['']);
      }
    });
  }

  redirectToRecuperarSenha() {
    const email = (this.solicitarTokenForm.getRawValue() as any).email || '';
    // Codifica o email em Base64 antes de passar na query string
    this.router.navigate(['/recuperar-senha'], { queryParams: { email: btoa(email) } });
  }
}


