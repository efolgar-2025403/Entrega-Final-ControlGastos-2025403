import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiHealthResponse {
  status: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private readonly http: HttpClient) {}

  getHealth(): Observable<ApiHealthResponse> {
    return this.http.get<ApiHealthResponse>(
      `${this.apiUrl}/health`
    );
  }
}