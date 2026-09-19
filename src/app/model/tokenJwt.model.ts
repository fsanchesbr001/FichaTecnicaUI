export interface TokenJwt {
  jwt: string;
  expirationMinutes?: number;
  expiresAt?: string;
  usuarioLogin?: string;
  usuarioNome?: string;
  role?: string;
  /** @deprecated backend nunca envia este campo; mantido apenas para compatibilidade retroativa */
  token?: string;
}
