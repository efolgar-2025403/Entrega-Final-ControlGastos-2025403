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

import {
  Income,
  IncomeService
} from '../../core/services/income.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  private readonly expenseService = inject(ExpenseService);
  private readonly categoryService = inject(CategoryService);
  private readonly incomeService = inject(IncomeService);

  expenses: Expense[] = [];
  categories: Category[] = [];
  incomes: Income[] = [];

  loading = true;
  errorMessage = '';

  totalExpenses = 0;
  totalAmount = 0;
  averageExpense = 0;
  totalIncome = 0;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {

    this.loading = true;
    this.errorMessage = '';

    // =========================================
    // GASTOS
    // =========================================

    this.expenseService.getExpenses().subscribe({

      next: (response) => {

        this.expenses = response.data ?? [];

        this.calculateTotals();

        this.loading = false;
      },

      error: (error) => {

        console.error(
          'Error loading expenses:',
          error
        );

        this.errorMessage =
          'No se pudieron cargar los gastos.';

        this.expenses = [];

        this.calculateTotals();

        this.loading = false;
      }

    });

    // =========================================
    // CATEGORÍAS
    // =========================================

    this.categoryService.getCategories().subscribe({

      next: (response) => {

        this.categories =
          response.data ?? [];

      },

      error: (error) => {

        console.error(
          'Error loading categories:',
          error
        );

        this.categories = [];

      }

    });

    // =========================================
    // INGRESOS
    // =========================================

    this.incomeService.getIncomes().subscribe({

      next: (response) => {

        this.incomes =
          response.data ?? [];

        this.calculateTotalIncome();

      },

      error: (error) => {

        console.error(
          'Error loading incomes:',
          error
        );

        this.incomes = [];

        this.totalIncome = 0;

      }

    });
  }

  // =========================================
  // CALCULAR TOTALES DE GASTOS
  // =========================================

  calculateTotals(): void {

    this.totalExpenses =
      this.expenses.length;

    this.totalAmount =
      this.expenses.reduce(
        (total, expense) =>
          total + Number(expense.amount),
        0
      );

    this.averageExpense =
      this.totalExpenses > 0
        ? this.totalAmount / this.totalExpenses
        : 0;
  }

  // =========================================
  // CALCULAR TOTAL DE INGRESOS
  // =========================================

  calculateTotalIncome(): void {

    this.totalIncome =
      this.incomes.reduce(
        (total, income) =>
          total + Number(income.amount),
        0
      );
  }

  // =========================================
  // NOMBRE DE CATEGORÍA
  // =========================================

  getCategoryName(
    categoryId: string
  ): string {

    const category =
      this.categories.find(
        category =>
          Number(category.id) ===
          Number(categoryId)
      );

    return category?.name ??
      'Sin categoría';
  }

  // =========================================
  // OBTENER CATEGORÍA
  // =========================================

  getCategory(
    categoryId: number
  ): Category | undefined {

    return this.categories.find(
      category =>
        Number(category.id) ===
        Number(categoryId)
    );
  }

  // =========================================
  // SABER SI ES INGRESO
  // =========================================

  isIncomeCategory(
    categoryId: number
  ): boolean {

    const category =
      this.getCategory(categoryId);

    return category?.type === 'income';
  }

  // =========================================
  // SABER SI ES GASTO
  // =========================================

  isExpenseCategory(
    categoryId: number
  ): boolean {

    const category =
      this.getCategory(categoryId);

    return category?.type === 'expense';
  }

  // =========================================
  // TOTAL POR CATEGORÍA
  // =========================================

  getCategoryTotal(
    categoryId: number
  ): number {

    const category =
      this.getCategory(categoryId);

    if (!category) {
      return 0;
    }

    // -----------------------------------------
    // CATEGORÍA DE GASTO
    // -----------------------------------------

    if (category.type === 'expense') {

      return this.expenses
        .filter(
          expense =>
            Number(expense.category_id) ===
            Number(categoryId)
        )
        .reduce(
          (total, expense) =>
            total + Number(expense.amount),
          0
        );
    }

    // -----------------------------------------
    // CATEGORÍA DE INGRESO
    // -----------------------------------------

    if (category.type === 'income') {

      return this.incomes
        .filter(
          income =>
            Number(income.category_id) ===
            Number(categoryId)
        )
        .reduce(
          (total, income) =>
            total + Number(income.amount),
          0
        );
    }

    return 0;
  }

  // =========================================
  // TOTAL GENERAL SEGÚN TIPO
  // =========================================

  getCategoryTypeTotal(
    type: 'expense' | 'income'
  ): number {

    if (type === 'expense') {
      return this.totalAmount;
    }

    return this.totalIncome;
  }

  // =========================================
  // PORCENTAJE POR CATEGORÍA
  // =========================================

  getCategoryPercentage(
    categoryId: number
  ): number {

    const category =
      this.getCategory(categoryId);

    if (!category) {
      return 0;
    }

    const categoryTotal =
      this.getCategoryTotal(categoryId);

    const total =
      this.getCategoryTypeTotal(
        category.type
      );

    if (total === 0) {
      return 0;
    }

    return (
      (categoryTotal / total) * 100
    );
  }

  // =========================================
  // ÚLTIMOS GASTOS
  // =========================================

  getRecentExpenses(): Expense[] {

    return [...this.expenses]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 5);
  }

  // =========================================
  // FECHA
  // =========================================

  formatDate(
    date: string
  ): string {

    return new Intl.DateTimeFormat(
      'es-GT',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(
      new Date(date)
    );
  }

  // =========================================
  // ACTUALIZAR
  // =========================================

  refresh(): void {

    this.loadDashboard();

  }
}