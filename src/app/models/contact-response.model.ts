export interface ContactResponse {
  status:
    | 'SUCCESS'
    | 'INVALID_FIRST_NAME'
    | 'INVALID_LAST_NAME'
    | 'INVALID_EMAIL'
    | 'INVALID_ATTACHMENTS'
    | 'INVALID_CAPTCHA';
  id: number;
  createdAt: string;
}
