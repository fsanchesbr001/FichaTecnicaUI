import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { JwtService } from './jwt.service';

describe('AuthService API proxy', () => {
  let service: AuthService;
  let http: HttpClient;
  let requests: HttpTestingController;
  let jwt: jasmine.SpyObj<JwtService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    jwt = jasmine.createSpyObj<JwtService>('JwtService', ['getToken', 'removeToken']);
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    jwt.getToken.and.returnValue('test-token');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: JwtService, useValue: jwt },
        { provide: Router, useValue: router }
      ]
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpClient);
    requests = TestBed.inject(HttpTestingController);
  });

  afterEach(() => requests.verify());

  it('uses the proxy for login without JWT or CORS response headers', () => {
    service.login({ login: 'usuario', senha: 'senha' }).subscribe();
    const request = requests.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ login: 'usuario', senha: 'senha' });
    expect(request.request.headers.has('Authorization')).toBeFalse();
    expect(request.request.headers.has('Access-Control-Allow-Origin')).toBeFalse();
    expect(request.request.headers.has('Access-Control-Allow-Headers')).toBeFalse();
    request.flush({ jwt: 'login-token' });
  });

  it('keeps password recovery public behind the proxy', () => {
    service.iniciarRecuperacaoSenha('usuario@example.com').subscribe();
    const request = requests.expectOne('/api/ficha-tecnica/login-recuperacao-senha');
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({ jwt: 'recovery-token' });
  });

  it('encodes email and includes JWT on authenticated API requests', () => {
    service.buscarUsuarioPorEmail('usuario+teste@example.com').subscribe();
    const request = requests.expectOne('/api/ficha-tecnica/usuarios/buscar-usuario/usuario%2Bteste%40example.com');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush({});
  });

  it('uses the proxy for logout and password management', () => {
    const payload = {
      email: 'usuario@example.com',
      cpf: '00000000000',
      tokenSeguranca: 'test-token',
      senha: 'senha',
      confirmacaoSenha: 'senha'
    };
    service.logout().subscribe();
    service.enviarEmailRecuperacao(payload.email).subscribe();
    service.trocarSenha(payload).subscribe();

    for (const url of [
      '/api/auth/logout',
      '/api/ficha-tecnica/enviar-email-seguranca',
      '/api/ficha-tecnica/trocar-senha'
    ]) {
      const request = requests.expectOne(url);
      expect(request.request.method).toBe('POST');
      expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
      request.flush({});
    }
  });

  it('preserves the expired JWT handling for proxied requests', () => {
    http.get('/api/ficha-tecnica/usuarios').subscribe({ error: () => {} });
    requests.expectOne('/api/ficha-tecnica/usuarios').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(jwt.removeToken).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });
});
