import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { UserSignupResponse } from '../models/user-signup-response.model';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class UserCreateService extends ApiService {
  constructor(private http: HttpClient) {
    super();
  }

  create(formData: FormData): Observable<UserSignupResponse> {
    return this.http.post<UserSignupResponse>(`${this.apiUrl}/user/create`, formData);
  }

  checkNicknameExists(nickname: string): Observable<boolean> {
    return this.http
      .get<{ exists: boolean }>(`${this.apiUrl}/users/nickname-exists?nick=${nickname}`)
      .pipe(map((res) => res.exists));
  }
}
