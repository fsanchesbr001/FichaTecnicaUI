import { Component, Input } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatError, MatFormField,  MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatOption, MatSelect} from '@angular/material/select';
import {Router} from '@angular/router';

@Component({
  selector: 'app-formulario-conversoes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardTitle,
    MatFormField,
    MatError,
    MatIcon,
    MatLabel,
    ReactiveFormsModule,
    MatInput,
    MatSuffix,
    MatButton,
    MatSelect,
    MatOption
  ],
  templateUrl: './formulario-conversoes.component.html',
  styleUrl: './formulario-conversoes.component.css'
})
export class FormularioConversoesComponent {

  @Input() conversoes: any;
  form!: FormGroup;
  comboDe = ['Grama', 'Quilograma', 'Litro', 'Mililitro', 'Dúzia'];
  comboPara = ['Grama', 'Quilograma', 'Litro', 'Mililitro', 'Dúzia'];
  comboOperacao = ['Divide', 'Multiplica'];

  constructor(private fb: FormBuilder, private router: Router) {
    // Inicializa o formulário com valores padrão se necessário
    this.form = this.fb.group({
      comboDe: ['', Validators.required],
      comboPara: ['', Validators.required],
      comboOperacao: ['', Validators.required],
      fator: ['', [Validators.required, Validators.min(0.0001)]]
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
    this.router.navigate(['/principal/lista-conversoes']);
    console.log('Ação cancelada');
  }

  onImprimir() {
    // Aqui você pode implementar a lógica para imprimir o formulário ou os dados do usuário
    console.log('Imprimindo formulário...');
  }
}
