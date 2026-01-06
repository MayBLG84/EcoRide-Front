export interface Ride {
  id: number;
  driver: {
    id: number;
    nickname: string;
    photoThumbnail: string | null;
    avgRating: number | null;
  };
  date: string;
  departureTime: string;
  availableSeats: number;
  origin: { city: string; pickPoint?: string };
  destiny: { city: string; dropPoint?: string };
  estimatedDuration: number | null;
  vehicle: { brand?: string; model?: string; isElectric: boolean };
  preferences: { smoker?: boolean; animals?: boolean; other?: string };
  pricePerPerson: number;
  showDetails?: boolean;
  participating?: boolean;
}

export interface FiltersMeta {
  price: { min: number; max: number };
  duration: { min: number; max: number };
  rating: { min: number; max: number };
}

export interface RideSearchResponse {
  status: 'EXACT_MATCH' | 'FUTURE_MATCH' | 'NO_MATCH' | 'INVALID_REQUEST';
  rides: Ride[];
  pagination?: { page: number; pageSize: number; totalResults: number };
  totalResults?: number;
  filtersMeta?: FiltersMeta;
}
