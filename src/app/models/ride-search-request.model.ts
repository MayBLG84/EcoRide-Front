export interface RideSearchRequest {
  originCity?: string;
  destinyCity?: string;
  date?: { year: number; month: number; day: number };
  page?: number;
  limit?: number;
  filters?: {
    electricOnly?: boolean;
    priceMin?: number;
    priceMax?: number;
    durationMin?: number;
    durationMax?: number;
    ratingMin?: number;
  };
  orderBy?: 'PRICE_ASC' | 'PRICE_DESC' | 'DURATION_ASC' | 'DURATION_DESC';
}
