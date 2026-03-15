import { Component, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export type ToastTipo = 'sucesso' | 'erro' | 'aviso' | 'info';

export interface ToastData {
  tipo: ToastTipo;
  mensagem: string;
}

@Component({
  selector: 'app-toast-notificacao',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './toast-notificacao.component.html',
  styleUrls: ['./toast-notificacao.component.css'],
})
export class ToastNotificacaoComponent {
  icone: string;

  private static readonly ICONES: Record<ToastTipo, string> = {
    sucesso: 'check_circle',
    erro:    'error',
    aviso:   'warning',
    info:    'info',
  };

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: ToastData,
    private snackBarRef: MatSnackBarRef<ToastNotificacaoComponent>,
  ) {
    this.icone = ToastNotificacaoComponent.ICONES[data.tipo] ?? 'info';
  }

  fechar(): void {
    this.snackBarRef.dismiss();
  }
}

