import { Injectable } from '@angular/core';

interface JwtPayload {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  private readonly TOKEN_KEY = 'jwt_token';

  constructor() {}

  /**
   * Armazena o token JWT no localStorage
   * @param token Token JWT a ser armazenado
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Recupera o token JWT do localStorage
   * @returns Token JWT armazenado ou null
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Remove o token JWT do localStorage
   */
  removeToken(): void {
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
}


