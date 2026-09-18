import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiErrorService {
  extrairMensagem(erro: unknown, fallback = 'Erro ao processar a solicitação.'): string {
    if (typeof erro === 'string' && erro.trim()) {
      return erro.trim();
    }

    if (erro instanceof HttpErrorResponse) {
      return this.extrairDoBody(erro.error, fallback) ?? erro.message ?? fallback;
    }

    if (this.isObject(erro)) {
      return this.extrairDoBody(erro, fallback) ?? fallback;
    }

    return fallback;
  }

  private extrairDoBody(body: unknown, fallback: string): string | null {
    if (typeof body === 'string' && body.trim()) {
      return body.trim();
    }

    if (!this.isObject(body)) {
      return null;
    }

    const candidatos = [
      body['message'],
      body['mensagem'],
      body['erro'],
      body['error'],
      body['detail'],
      body['jwt'],
    ];

    const mensagem = candidatos.find((valor): valor is string => typeof valor === 'string' && valor.trim().length > 0);
    return mensagem?.trim() ?? fallback;
  }

  private isObject(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null;
  }
}
