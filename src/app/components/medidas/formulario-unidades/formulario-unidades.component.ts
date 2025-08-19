import {Component, Input} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatError, MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {Router} from '@angular/router';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-formulario-unidades',
  imports: [
    FormsModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    ReactiveFormsModule,
    MatButton,
    MatError,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatSuffix
  ],
  templateUrl: './formulario-unidades.component.html',
  styleUrl: './formulario-unidades.component.css'
})
export class FormularioUnidadesComponent {
  @Input() medida: any;
  form!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    // Inicializa o formulário com valores padrão se necessário
    this.form = this.fb.group({
      nome: ['', Validators.required],
      sigla: ['', [Validators.required]]
    });
  }

  onSalvar() {
    if (this.form.valid) {
      // Aqui você pode enviar os dados do formulário para o backend ou realizar outras ações
      console.log('Formulário enviado com sucesso!', this.form.value);
    } else {
      console.log('Formulário inválido');
    }
  }

  onCancelar() {
    this.router.navigate(['/principal/lista-medidas']);
    console.log('Ação cancelada');
  }

  onImprimir() {
    // Aqui você pode implementar a lógica para imprimir o formulário ou os dados do usuário
    console.log('Imprimindo formulário...');
  }
}
