import { Component } from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {NgOptimizedImage} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatError, MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import { Router } from '@angular/router';

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
export class SolicitarTokenComponent {
  solicitarTokenForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ])
  });

  isTokenButtonEnabled: boolean = false;


  constructor(private SnackBar: MatSnackBar, private router: Router) {

  }

  onSubmit() {
    if (this.solicitarTokenForm.valid) {
        this.isTokenButtonEnabled = true;
        this.SnackBar.open('Token enviado com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
    }
  }

  redirectToRecuperarSenha() {
    this.router.navigate(['/recuperar-senha']);
  }
}
