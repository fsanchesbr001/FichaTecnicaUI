import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, take} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Usuario} from '../model/usuario.model';
import {TokenJwt} from '../model/tokenJwt.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private readonly urlAddress:string = `${environment.API}auth/login`;
  private readonly logoutUrl:string = `${environment.API}auth/logout`;
  private readonly sitePermitido:string = `${environment.CORS_ORIGIN_ALLOWED}`;
  private readonly loginRecuperacaoUrl:string = `${environment.API}ficha-tecnica/login-recuperacao-senha`;
  private readonly buscarUsuarioUrl:string = `${environment.API}ficha-tecnica/usuarios/buscar-usuario`;
  private readonly enviarEmailUrl:string = `${environment.API}ficha-tecnica/enviar-email-seguranca`;
  private readonly trocarSenhaUrl:string = `${environment.API}ficha-tecnica/trocar-senha`;

  constructor(private http:HttpClient) {}


  /**
   * Realiza login na aplicação
   * @param Objeto Usuario contendo login e senha
   * @returns Observable com o resultado do login, incluindo token JWT em caso de sucesso
   */
  login(usuario :Usuario): Observable<TokenJwt> {

    console.log('=== INICIANDO LOGIN ===');
    return this.http.post<TokenJwt>(this.urlAddress, usuario,
      {headers:{'Content-Type':'application/json',
          'Access-Control-Allow-Origin':`${this.sitePermitido}`,
          'Access-Control-Allow-Headers':'Content-Type'
          }}).pipe(take(1));
  }

  /**
   * Realiza logout na aplicação
   * @returns Observable com o resultado do logout
   */
  logout(): Observable<any> {
    return this.http.post<any>(this.logoutUrl, {}).pipe(take(1));
  }

  /**
   * Inicia o fluxo de recuperação de senha
   * @param email E-mail do usuário
   * @returns Observable com o token JWT temporário para uso nos passos seguintes
   */
  iniciarRecuperacaoSenha(email: string): Observable<TokenJwt> {
    return this.http.post<TokenJwt>(this.loginRecuperacaoUrl, { email }).pipe(take(1));
  }

  /**
   * Busca um usuário pelo e-mail
   * @param email E-mail do usuário
   * @returns Observable com os dados do usuário
   */
  buscarUsuarioPorEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.buscarUsuarioUrl}/${email}`).pipe(take(1));
  }

  /**
   * Envia e-mail de recuperação de senha
   * @param email E-mail do destinatário
   * @returns Observable com o resultado do envio
   */
  enviarEmailRecuperacao(email: string): Observable<any> {
    return this.http.post<any>(this.enviarEmailUrl, { email }).pipe(take(1));
  }

  /**
   * Troca a senha do usuário após validação do token de segurança
   * @param payload Objeto com email, cpf, tokenSeguranca, senha e confirmacaoSenha (senhas em Base64)
   * @returns Observable com o resultado da operação
   */
  trocarSenha(payload: {
    email: string;
    cpf: string;
    tokenSeguranca: string;
    senha: string;
    confirmacaoSenha: string;
  }): Observable<any> {
    return this.http.post<any>(this.trocarSenhaUrl, payload).pipe(take(1));
  }
}

