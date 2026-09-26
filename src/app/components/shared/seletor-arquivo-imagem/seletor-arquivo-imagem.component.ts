import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-seletor-arquivo-imagem',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SeletorArquivoImagemComponent),
      multi: true,
    },
  ],
  templateUrl: './seletor-arquivo-imagem.component.html',
  styleUrl: './seletor-arquivo-imagem.component.css',
})
export class SeletorArquivoImagemComponent implements ControlValueAccessor {
  @Input() label = 'Imagem';
  @Input() placeholder = 'Selecione um arquivo de imagem';
  @Input() accept = 'image/*';
  @Input() appearance: 'fill' | 'outline' = 'fill';
  @Input() erro: string | null = null;
  @Input() imageUrlAtual = '';

  @Output() arquivoSelecionado = new EventEmitter<File | null>();

  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  nomeExibido = '';
  desabilitado = false;
  arquivoLocalSelecionado = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.nomeExibido = this.extrairNomeExibido(value ?? '');
    this.arquivoLocalSelecionado = false;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.desabilitado = isDisabled;
  }

  abrirSeletor(): void {
    if (this.desabilitado) {
      return;
    }

    this.fileInput?.nativeElement.click();
  }

  marcarComoTocado(): void {
    this.onTouched();
  }

  onArquivoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0] ?? null;

    if (!arquivo) {
      return;
    }

    if (arquivo.type && !arquivo.type.startsWith('image/')) {
      input.value = '';
      return;
    }

    this.nomeExibido = arquivo.name;
    this.arquivoLocalSelecionado = true;
    this.onChange(arquivo.name);
    this.onTouched();
    this.arquivoSelecionado.emit(arquivo);
    input.value = '';
  }

  limparSelecao(event?: MouseEvent): void {
    event?.stopPropagation();

    if (this.desabilitado) {
      return;
    }

    this.nomeExibido = '';
    this.arquivoLocalSelecionado = false;
    this.onChange('');
    this.onTouched();
    this.arquivoSelecionado.emit(null);

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private extrairNomeExibido(valor: string): string {
    const conteudo = valor.trim();
    if (!conteudo) {
      return '';
    }

    const semQueryString = conteudo.split('?')[0].split('#')[0];
    const partes = semQueryString.split(/[\\/]/).filter(Boolean);
    return partes.length ? partes[partes.length - 1] : conteudo;
  }

  get deveMostrarImagemAtual(): boolean {
    const url = this.imageUrlAtual?.trim();
    if (!url) {
      return false;
    }

    if (!this.arquivoLocalSelecionado) {
      return true;
    }

    return url.startsWith('blob:');
  }
}
