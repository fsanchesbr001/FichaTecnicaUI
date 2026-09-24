import { Injectable } from '@angular/core';

interface JwtPayload {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  private readonly TOKEN_KEY = 'jwt_token';

  constructor() {
    // Tokens previously persisted in localStorage must not survive this change.
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Armazena o token JWT apenas durante a sessão da aba/janela.
   * @param token Token JWT a ser armazenado
   */
  setToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Recupera o token JWT da sessão atual.
   * @returns Token JWT armazenado ou null
   */
  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Remove o token JWT da sessão atual.
   */
  removeToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Decodifica um token JWT e retorna o payload
   * @param token Token JWT a ser decodificado
   * @returns Objeto com os dados do payload ou null se inválido
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        console.error('Token inválido: não contém 3 partes');
        return null;
      }

      const payload = parts[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }

  /**
   * Verifica se o token ainda é válido
   * @param token Token JWT a ser verificado
   * @returns true se o token ainda é válido, false caso contrário
   */
  isTokenValid(token: string): boolean {
    const payload = this.decodeToken(token);

    if (!payload || !payload['exp']) {
      return false;
    }

    const agora = Math.floor(Date.now() / 1000);
    return payload['exp'] > agora;
  }

  /**
   * Verifica se há um token válido armazenado
   * @returns true se há um token válido, false caso contrário
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    return token !== null && this.isTokenValid(token);
  }

  /**
   * Verifica se o token armazenado pertence ao usuário técnico de sistema (ROLE_SYSTEM),
   * emitido pelo fluxo de recuperação de senha/primeiro acesso. Este token não representa
   * uma sessão real de usuário e não deve ser tratado como "logado" pelos guards de rota.
   * @returns true se o token válido armazenado possui role SYSTEM
   */
  isSystemToken(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    const payload = this.decodeToken(token);
    const role = payload?.['role'];
    return typeof role === 'string' && role.toUpperCase().includes('SYSTEM');
  }
}

