import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private apiUrl = 'http://localhost:8000/api/search';

  constructor(private http: HttpClient) {}

  search(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
}
