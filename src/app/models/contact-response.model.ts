export interface ContactResponse {
  status: 'SUCCESS' | 'INVALID_FIRST_NAME' | 'INVALID_LAST_NAME' | 'INVALID_EMAIL';
  id: number;
  firstName: string;
  createdAt: string;
}
