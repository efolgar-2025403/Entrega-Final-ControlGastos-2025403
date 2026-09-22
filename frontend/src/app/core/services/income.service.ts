import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Income {
  id: string;
  amount: string;
  description: string;
  date: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}

export interface IncomeResponse {
  success: boolean;
  data: Income;
}

export interface IncomesResponse {
  success: boolean;
  data: Income[];
}

export interface CreateIncomeRequest {
  amount: number;
  description: string;
  date: string;
  category_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class IncomeService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/incomes';

  getIncomes(): Observable<IncomesResponse> {
    return this.http.get<IncomesResponse>(
      this.apiUrl
    );
  }

  getIncomeById(
    id: string
  ): Observable<IncomeResponse> {
    return this.http.get<IncomeResponse>(
      `${this.apiUrl}/${id}`
    );
  }

  createIncome(
    income: CreateIncomeRequest
  ): Observable<IncomeResponse> {
    return this.http.post<IncomeResponse>(
      this.apiUrl,
      income
    );
  }

  updateIncome(
    id: string,
    income: CreateIncomeRequest
  ): Observable<IncomeResponse> {
    return this.http.put<IncomeResponse>(
      `${this.apiUrl}/${id}`,
      income
    );
  }

  deleteIncome(
    id: string
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}