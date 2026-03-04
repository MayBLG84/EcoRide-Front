export interface ContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  reason: string;
  detail: string;
  description: string;
  attachments?: File[] | null;
  rideId?: string;
  honeypot?: string;
  turnstileToken?: string;
}
