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
  private readonly sitePermitido:string = `${environment.CORS_ORIGIN_ALLOWED}`;

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
}

