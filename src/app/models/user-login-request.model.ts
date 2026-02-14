export interface UserLoginRequest {
  email: string;
  password: string;
  honeypot?: string;
  turnstileToken?: string;
}
