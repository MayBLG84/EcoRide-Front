import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ride, RideSearchResponse } from '../models/ride-search-response.model';
import { RideSearchRequest } from '../models/ride-search-request.model';

@Injectable({
  providedIn: 'root',
})
export class SearchRideService {
  private apiUrl = 'http://localhost:8000/api/rides/search';

  constructor(private http: HttpClient) {}

  searchRides(request: RideSearchRequest): Observable<RideSearchResponse> {
    let params = new HttpParams();

    if (request.originCity) params = params.set('originCity', request.originCity);
    if (request.destinyCity) params = params.set('destinyCity', request.destinyCity);
    if (request.date) {
      params = params
        .set('date[year]', request.date.year.toString())
        .set('date[month]', request.date.month.toString())
        .set('date[day]', request.date.day.toString());
    }
    if (request.page) params = params.set('page', request.page.toString());
    if (request.limit) params = params.set('limit', request.limit.toString());

    if (request.orderBy) {
      params = params.set('orderBy', request.orderBy);
    }

    if (request.filters) {
      Object.entries(request.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== false && value !== 0) {
          params = params.set(`filters[${key}]`, String(value));
        }
      });
    }

    return this.http.get<RideSearchResponse>(this.apiUrl, { params });
  }
}
