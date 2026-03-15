import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastNotificacaoComponent, ToastTipo } from '../components/shared/toast-notificacao/toast-notificacao.component';

@Injectable({ providedIn: 'root' })
export class ToastService {

  constructor(private snackBar: MatSnackBar) {}

  private abrir(tipo: ToastTipo, mensagem: string, duracao: number): void {
    this.snackBar.openFromComponent(ToastNotificacaoComponent, {
      data: { tipo, mensagem },
      duration: duracao,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['toast-custom', `toast-${tipo}`],
    });
  }

  sucesso(mensagem: string, duracao = 3000): void { this.abrir('sucesso', mensagem, duracao); }
  erro(mensagem: string, duracao = 5000): void    { this.abrir('erro',    mensagem, duracao); }
  aviso(mensagem: string, duracao = 4000): void   { this.abrir('aviso',   mensagem, duracao); }
  info(mensagem: string, duracao = 4000): void    { this.abrir('info',    mensagem, duracao); }
}

