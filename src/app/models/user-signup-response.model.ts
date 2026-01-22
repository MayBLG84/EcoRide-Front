export interface UserSignupResponse {
  status:
    | 'EMAIL_ALREADY_EXISTS'
    | 'SUCCESS'
    | 'NICKNAME_ALREADY_EXISTS'
    | 'INVALID_FIRST_NAME'
    | 'INVALID_LAST_NAME'
    | 'INVALID_NICKNAME'
    | 'INVALID_EMAIL'
    | 'INVALID_TELEPHONE'
    | 'INVALID_PASSWORD'
    | 'INVALID_BIRTHDAY'
    | 'INVALID_USAGE_TYPE';
  id: number;
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  createdAt: string;
}
