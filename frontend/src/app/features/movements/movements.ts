import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import {
  Expense,
  ExpenseService
} from '../../core/services/expense.service';

import {
  Category,
  CategoryService
} from '../../core/services/category.service';

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movements.html',
  styleUrl: './movements.scss'
})
export class Movements implements OnInit {

  private readonly expenseService = inject(ExpenseService);
  private readonly categoryService = inject(CategoryService);

  expenses: Expense[] = [];
  categories: Category[] = [];

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadCategories();
    this.loadMovements();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.data;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadMovements(): void {
    this.loading = true;
    this.errorMessage = '';

    this.expenseService.getExpenses().subscribe({
      next: (response) => {
        this.expenses = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading movements:', error);
        this.errorMessage = 'No se pudieron cargar los movimientos.';
        this.loading = false;
      }
    });
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(
      item => Number(item.id) === Number(categoryId)
    );

    return category?.name ?? 'Sin categoría';
  }

  getAmount(amount: string): number {
    return Number(amount);
  }

  getTotal(): number {
    return this.expenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0
    );
  }
}

