import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PaginaErroData {
  mensagem: string;
  rotaVoltar: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaginaErroService {
  private erroDataSubject = new BehaviorSubject<PaginaErroData>({
    mensagem: '',
    rotaVoltar: ''
  });

  public erroData$: Observable<PaginaErroData> = this.erroDataSubject.asObservable();

  constructor() {}

  /**
   * Define os dados de erro e navega para a página de erro
   */
  definirErro(mensagem: string, rotaVoltar: string): void {
    this.erroDataSubject.next({
      mensagem,
      rotaVoltar
    });
  }

  /**
   * Obtém os dados de erro atual
   */
  obterErroAtual(): PaginaErroData {
    return this.erroDataSubject.value;
  }

  /**
   * Limpa os dados de erro
   */
  limparErro(): void {
    this.erroDataSubject.next({
      mensagem: '',
      rotaVoltar: ''
    });
  }
}

