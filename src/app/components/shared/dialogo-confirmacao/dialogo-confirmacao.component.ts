import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogoConfirmacaoData {
  titulo: string;
  mensagem: string;
  onConfirmar: () => void;
}

@Component({
  selector: 'app-dialogo-confirmacao',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './dialogo-confirmacao.component.html',
})
export class DialogoConfirmacaoComponent {
  titulo: string;
  mensagem: string;

  constructor(
    private dialogRef: MatDialogRef<DialogoConfirmacaoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogoConfirmacaoData
  ) {
    this.titulo = data.titulo;
    this.mensagem = data.mensagem;
  }

  confirmar(): void {
    this.data.onConfirmar();
    this.dialogRef.close(true);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}

