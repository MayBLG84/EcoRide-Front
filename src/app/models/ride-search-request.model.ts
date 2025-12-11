export interface RideSearchRequest {
  originCity?: string;
  destinyCity?: string;
  date?: { year: number; month: number; day: number };
  page?: number;
}
