import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Expense {
  id: string;
  amount: string;
  description: string;
  date: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseResponse {
  success: boolean;
  data: Expense;
}

export interface ExpensesResponse {
  success: boolean;
  data: Expense[];
}

export interface CreateExpenseRequest {
  amount: number;
  description: string;
  date: string;
  category_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3000/api/expenses';

  getExpenses(): Observable<ExpensesResponse> {
    return this.http.get<ExpensesResponse>(this.apiUrl);
  }

  getExpenseById(id: string): Observable<ExpenseResponse> {
    return this.http.get<ExpenseResponse>(`${this.apiUrl}/${id}`);
  }

  createExpense(
    expense: CreateExpenseRequest
  ): Observable<ExpenseResponse> {
    return this.http.post<ExpenseResponse>(
      this.apiUrl,
      expense
    );
  }

  updateExpense(
    id: string,
    expense: CreateExpenseRequest
  ): Observable<ExpenseResponse> {
    return this.http.put<ExpenseResponse>(
      `${this.apiUrl}/${id}`,
      expense
    );
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}