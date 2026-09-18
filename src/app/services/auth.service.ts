import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, take} from 'rxjs';
import {environment} from '../../../environments/environment';
import {UsuarioLogin, UsuarioResponse} from '../model/usuario.model';
import {TokenJwt} from '../model/tokenJwt.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private readonly authBaseUrl = `${environment.API}auth`;
  private readonly usuariosBaseUrl = `${environment.API}ficha-tecnica/usuarios`;
  private readonly loginUrl = `${this.authBaseUrl}/login`;
  private readonly logoutUrl = `${this.authBaseUrl}/logout`;
  private readonly loginRecuperacaoUrl = `${environment.API}ficha-tecnica/login-recuperacao-senha`;
  private readonly enviarEmailUrl = `${environment.API}ficha-tecnica/enviar-email-seguranca`;
  private readonly trocarSenhaUrl = `${environment.API}ficha-tecnica/trocar-senha`;
  private readonly sitePermitido:string = `${environment.CORS_ORIGIN_ALLOWED}`;

  constructor(private http:HttpClient) {}


  /**
   * Realiza login na aplicação
   * @param Objeto Usuario contendo login e senha
   * @returns Observable com o resultado do login, incluindo token JWT em caso de sucesso
   */
  login(usuario :UsuarioLogin): Observable<TokenJwt> {
    const payload = {
      login: usuario.login,
      senha: usuario.senha
    };

    return this.http.post<TokenJwt>(this.loginUrl, payload,
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
  buscarUsuarioPorEmail(email: string): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.usuariosBaseUrl}/${encodeURIComponent(email)}`).pipe(take(1));
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
