import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { UserSignupResponse } from '../models/user-signup-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserCreateService {
  private apiUrl = 'http://localhost:8000/api/user/create';
  private checkNickUrl = 'http://localhost:8000/api/users/nickname-exists';

  constructor(private http: HttpClient) {}

  create(formData: FormData): Observable<UserSignupResponse> {
    return this.http.post<UserSignupResponse>(this.apiUrl, formData);
  }

  checkNicknameExists(nickname: string): Observable<boolean> {
    return this.http
      .get<{ exists: boolean }>(`${this.checkNickUrl}?nick=${nickname}`)
      .pipe(map((res) => res.exists));
  }
}
