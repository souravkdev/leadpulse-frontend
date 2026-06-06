export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
  type: string;
}
