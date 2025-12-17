import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface City {
  nom: string;
  code: string;
}

@Injectable({ providedIn: 'root' })
export class CityService {
  private readonly API_URL = 'https://geo.api.gouv.fr/communes';

  constructor(private http: HttpClient) {}

  searchCities(query: string): Observable<City[]> {
    return this.http.get<City[]>(this.API_URL, {
      params: {
        nom: query,
        limit: 10,
      },
    });
  }
}
