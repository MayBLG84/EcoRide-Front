export interface UserLoginResponse {
  status: 'SUCCESS' | 'INVALID_INPUTS' | 'INTERNAL_ERROR' | 'TOO_MANY_ATTEMPTS';
  userId?: string;
  token?: string;
  roles?: string[];
}
