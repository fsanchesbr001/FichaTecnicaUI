export interface TokenJwt {
  token: string;
  type?: string;
  expiresAt?: string;
  expiresIn?: number;
  jwt?: string;
}
