import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogoInformacaoData {
  titulo: string;
  mensagem: string;
}

@Component({
  selector: 'app-dialogo-informacao',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './dialogo-informacao.component.html',
})
export class DialogoInformacaoComponent {
  titulo: string;
  mensagem: string;

  constructor(
    private dialogRef: MatDialogRef<DialogoInformacaoComponent>,
    @Inject(MAT_DIALOG_DATA) data: DialogoInformacaoData
  ) {
    this.titulo = data.titulo;
    this.mensagem = data.mensagem;
  }

  fechar(): void {
    this.dialogRef.close();
  }
}

