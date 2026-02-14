import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserLoginRequest } from '../models/user-login-request.model';
import { UserLoginResponse } from '../models/user-login-response.model';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class LoginService extends ApiService {
  constructor(private http: HttpClient) {
    super();
  }

  login(request: UserLoginRequest): Observable<UserLoginResponse> {
    return this.http.post<UserLoginResponse>(`${this.apiUrl}/login`, request);
  }
}
