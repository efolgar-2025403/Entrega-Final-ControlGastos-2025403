import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import {
  Category,
  CategoryService
} from '../../core/services/category.service';

import {
  Expense,
  ExpenseService
} from '../../core/services/expense.service';

interface CategoryReport {
  category: Category;
  total: number;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class Reports implements OnInit {

  private readonly expenseService = inject(ExpenseService);
  private readonly categoryService = inject(CategoryService);

  expenses: Expense[] = [];
  categories: Category[] = [];

  reports: CategoryReport[] = [];

  loading = true;
  errorMessage = '';

  totalExpenses = 0;
  totalAmount = 0;
  averageExpense = 0;
  highestExpense = 0;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.categoryService.getCategories().subscribe({
      next: (categoryResponse) => {
        this.categories = categoryResponse.data;

        this.expenseService.getExpenses().subscribe({
          next: (expenseResponse) => {
            this.expenses = expenseResponse.data;
            this.calculateReports();
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading expenses:', error);
            this.errorMessage = 'No se pudieron cargar los gastos.';
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.errorMessage = 'No se pudieron cargar las categorías.';
        this.loading = false;
      }
    });
  }

  calculateReports(): void {
    this.totalExpenses = this.expenses.length;

    this.totalAmount = this.expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );

    this.averageExpense =
      this.totalExpenses > 0
        ? this.totalAmount / this.totalExpenses
        : 0;

    this.highestExpense =
      this.expenses.length > 0
        ? Math.max(
            ...this.expenses.map(expense => Number(expense.amount))
          )
        : 0;

    this.reports = this.categories.map(category => {
      const categoryExpenses = this.expenses.filter(
        expense =>
          Number(expense.category_id) === Number(category.id)
      );

      const total = categoryExpenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
      );

      const percentage =
        this.totalAmount > 0
          ? (total / this.totalAmount) * 100
          : 0;

      return {
        category,
        total,
        count: categoryExpenses.length,
        percentage
      };
    })
    .filter(report => report.count > 0)
    .sort((a, b) => b.total - a.total);
  }

  getPercentage(value: number): number {
    return Math.round(value * 100) / 100;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(
      item => Number(item.id) === Number(categoryId)
    );

    return category?.name ?? 'Sin categoría';
  }

  getDate(date: string): Date {
    return new Date(date);
  }
}