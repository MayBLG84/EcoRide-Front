import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RideParticipationRequest } from '../models/ride-participation-request.model';

@Injectable({
  providedIn: 'root',
})
export class RideParticipation {
  private baseUrl = 'api/rides';

  constructor(private http: HttpClient) {}

  addPassengerToRide(payload: RideParticipationRequest): Observable<any> {
    return this.http.post('${this.baseURL}/addPassengerToARide', payload);
  }

  removePassengerFromRide(payload: RideParticipationRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/removePassengerFromARide`, payload);
  }
}
