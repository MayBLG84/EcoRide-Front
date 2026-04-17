import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserInfoResponse } from '../models/user-info-response.model';
import { ApiService } from './api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService extends ApiService {
  private http = inject(HttpClient);

  getCurrentUser(): Observable<UserInfoResponse> {
    return this.http.get<UserInfoResponse>(`${this.apiUrl}/api/users/me`);
  }
}
