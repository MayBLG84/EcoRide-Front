export interface RideSearchRequest {
  originCity?: string;
  destinyCity?: string;
  date?: { year: number; month: number; day: number };
  page?: number;
  limit?: number;
  filters?: {
    electricOnly?: boolean;
    priceMin?: number | null;
    priceMax?: number | null;
    durationMin?: number | null;
    durationMax?: number | null;
    ratingMin?: number | null;
  };
  orderBy?: 'PRICE_ASC' | 'PRICE_DESC' | 'DURATION_ASC' | 'DURATION_DESC';
}
