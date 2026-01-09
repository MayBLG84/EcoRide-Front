import { RideSearchRequest } from './ride-search-request.model';

export interface SearchState {
  originCity?: string;
  destinyCity?: string;
  date?: {
    year: number;
    month: number;
    day: number;
  };
  filters?: RideSearchRequest['filters'];
  orderBy?: RideSearchRequest['orderBy'];
  page: number;
}
