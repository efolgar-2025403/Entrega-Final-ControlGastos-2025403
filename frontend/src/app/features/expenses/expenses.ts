import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  Category,
  CategoryService
} from '../../core/services/category.service';

import {
  Expense,
  ExpenseService
} from '../../core/services/expense.service';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss'
})
export class Expenses implements OnInit {

  private readonly expenseService =
    inject(ExpenseService);

  private readonly categoryService =
    inject(CategoryService);

  expenses: Expense[] = [];

  categories: Category[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  editingId: string | null = null;

  minDate = '';

  maxDate = '';

  form = {
    amount: 0,
    description: '',
    date: '',
    category_id: 0
  };

  ngOnInit(): void {

    this.setDateRange();

    this.setDefaultDate();

    this.loadCategories();

    this.loadExpenses();
  }

  // =====================================================
  // CARGAR SOLO CATEGORÍAS DE GASTOS
  // =====================================================

  loadCategories(): void {

    this.categoryService
      .getCategories()
      .subscribe({

        next: (response) => {

          this.categories =
            response.data.filter(
              category =>
                category.type === 'expense'
            );

        },

        error: (error) => {

          console.error(
            'Error loading expense categories:',
            error
          );

          this.errorMessage =
            'No se pudieron cargar las categorías de gastos.';
        }

      });
  }

  // =====================================================
  // CARGAR GASTOS
  // =====================================================

  loadExpenses(): void {

    this.loading = true;

    this.errorMessage = '';

    this.expenseService
      .getExpenses()
      .subscribe({

        next: (response) => {

          this.expenses =
            response.data;

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Error loading expenses:',
            error
          );

          this.errorMessage =
            'No se pudieron cargar los gastos.';

          this.loading = false;

        }

      });
  }

  // =====================================================
  // GUARDAR GASTO
  // =====================================================

  saveExpense(): void {

    this.clearMessages();

    // ---------------------------------------------------
    // VALIDAR MONTO
    // ---------------------------------------------------

    if (this.form.amount <= 0) {

      this.errorMessage =
        'El monto debe ser mayor que cero.';

      return;
    }

    // ---------------------------------------------------
    // VALIDAR DESCRIPCIÓN
    // ---------------------------------------------------

    if (!this.form.description.trim()) {

      this.errorMessage =
        'La descripción es obligatoria.';

      return;
    }

    // ---------------------------------------------------
    // VALIDAR FECHA
    // ---------------------------------------------------

    if (!this.form.date) {

      this.errorMessage =
        'La fecha es obligatoria.';

      return;
    }

    // ---------------------------------------------------
    // VALIDAR CATEGORÍA
    // ---------------------------------------------------

    if (!this.form.category_id) {

      this.errorMessage =
        'Debes seleccionar una categoría de gasto.';

      return;
    }

    // ---------------------------------------------------
    // COMPROBAR QUE LA CATEGORÍA SEA DE GASTO
    // ---------------------------------------------------

    const selectedCategory =
      this.categories.find(
        category =>
          Number(category.id) ===
          Number(this.form.category_id)
      );

    if (
      !selectedCategory ||
      selectedCategory.type !== 'expense'
    ) {

      this.errorMessage =
        'La categoría seleccionada no corresponde a un gasto.';

      return;
    }

    this.saving = true;

    const request = {

      amount:
        Number(this.form.amount),

      description:
        this.form.description.trim(),

      date:
        this.form.date,

      category_id:
        Number(this.form.category_id)

    };

    // ===================================================
    // CREAR
    // ===================================================

    if (this.editingId === null) {

      this.expenseService
        .createExpense(request)
        .subscribe({

          next: () => {

            this.successMessage =
              'Gasto registrado correctamente.';

            this.resetForm();

            this.loadExpenses();

          },

          error: (error) => {

            console.error(
              'Error creating expense:',
              error
            );

            this.errorMessage =
              error?.error?.message ??
              'No se pudo registrar el gasto.';

            this.saving = false;

          }

        });

      return;
    }

    // ===================================================
    // ACTUALIZAR
    // ===================================================

    this.expenseService
      .updateExpense(
        this.editingId,
        request
      )
      .subscribe({

        next: () => {

          this.successMessage =
            'Gasto actualizado correctamente.';

          this.resetForm();

          this.loadExpenses();

        },

        error: (error) => {

          console.error(
            'Error updating expense:',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'No se pudo actualizar el gasto.';

          this.saving = false;

        }

      });
  }

  // =====================================================
  // EDITAR GASTO
  // =====================================================

  editExpense(
    expense: Expense
  ): void {

    this.clearMessages();

    this.editingId =
      expense.id;

    this.form = {

      amount:
        Number(expense.amount),

      description:
        expense.description,

      date:
        expense.date.substring(0, 10),

      category_id:
        Number(expense.category_id)

    };

    window.scrollTo({

      top: 0,

      behavior: 'smooth'

    });
  }

  // =====================================================
  // ELIMINAR GASTO
  // =====================================================

  deleteExpense(
    expense: Expense
  ): void {

    this.clearMessages();

    const confirmed =
      window.confirm(
        `¿Seguro que deseas eliminar el gasto "${expense.description}"?`
      );

    if (!confirmed) {
      return;
    }

    this.expenseService
      .deleteExpense(expense.id)
      .subscribe({

        next: () => {

          this.successMessage =
            'Gasto eliminado correctamente.';

          if (
            this.editingId ===
            expense.id
          ) {

            this.resetForm();

          }

          this.loadExpenses();

        },

        error: (error) => {

          console.error(
            'Error deleting expense:',
            error
          );

          this.errorMessage =
            'No se pudo eliminar el gasto.';

        }

      });
  }

  // =====================================================
  // OBTENER NOMBRE DE CATEGORÍA
  // =====================================================

  getCategoryName(
    categoryId: string
  ): string {

    const category =
      this.categories.find(
        item =>
          Number(item.id) ===
          Number(categoryId)
      );

    return category?.name ??
      'Sin categoría';
  }

  // =====================================================
  // RESET FORM
  // =====================================================

  resetForm(): void {

    this.form = {

      amount: 0,

      description: '',

      date: this.getToday(),

      category_id: 0

    };

    this.editingId = null;

    this.saving = false;
  }

  // =====================================================
  // CANCELAR EDICIÓN
  // =====================================================

  cancelEdit(): void {

    this.resetForm();

    this.clearMessages();
  }

  // =====================================================
  // RANGO DE FECHAS PERMITIDO (hoy - 7 días)
  // =====================================================

  setDateRange(): void {

    this.maxDate =
      this.formatDate(
        new Date()
      );

    const min =
      new Date();

    min.setDate(
      min.getDate() - 7
    );

    this.minDate =
      this.formatDate(min);
  }

  formatDate(
    date: Date
  ): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // =====================================================
  // FECHA POR DEFECTO
  // =====================================================

  setDefaultDate(): void {

    this.form.date =
      this.getToday();
  }

  getToday(): string {

    return this.formatDate(
      new Date()
    );
  }

  // =====================================================
  // LIMPIAR MENSAJES
  // =====================================================

  clearMessages(): void {

    this.errorMessage = '';

    this.successMessage = '';
  }
}