export interface UsuarioLogin {
  login: string;
  senha: string;
}

export interface UsuarioResponse {
  codigo?: number;
  nome: string;
  email: string;
  cpf: string;
  role: string;
  dataExpiracaoSenha?: string | null;
  tentativas?: number;
  primeiroAcesso?: boolean;
  bloqueadoAdmin?: boolean;
  bloqueadoTentativas?: boolean;
  bloqueadoExpiracao?: boolean;
  primeiro_acesso?: boolean | number;
  bloqueado_admin?: boolean | number;
  bloqueado_tentativas?: boolean | number;
  bloqueado_expiracao?: boolean | number;
  tokenSeguranca?: string | null;
  dataCriacao?: string | null;
  dataExpiracaoToken?: string | null;
}

export interface UsuarioRegistroRequest {
  nome: string;
  email: string;
  cpf: string;
  role: string;
  senha?: string | null;
}

export interface UsuarioAtualizacaoRequest {
  nome: string;
  role: string;
  primeiroAcesso: boolean;
  bloqueadoAdmin: boolean;
  bloqueadoTentativas: boolean;
  bloqueadoExpiracao: boolean;
}
