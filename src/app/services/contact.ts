import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiService } from './api';
import { ContactResponse } from '../models/contact-response.model';

@Injectable({
  providedIn: 'root',
})
export class ContactService extends ApiService {
  constructor(private http: HttpClient) {
    super();
  }

  create(formData: FormData): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(`${this.apiUrl}/contact`, formData);
  }
}
