import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  Category,
  CategoryService
} from '../../core/services/category.service';

import {
  Income,
  IncomeService
} from '../../core/services/income.service';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './income.html',
  styleUrl: './income.scss'
})
export class IncomeComponent implements OnInit {

  private readonly incomeService =
    inject(IncomeService);

  private readonly categoryService =
    inject(CategoryService);

  incomes: Income[] = [];

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

    this.loadIncomes();
  }

  // =====================================================
  // CARGAR SOLO CATEGORÍAS DE INGRESOS
  // =====================================================

  loadCategories(): void {

    this.categoryService
      .getCategories()
      .subscribe({

        next: (response) => {

          this.categories =
            response.data.filter(
              category =>
                category.type === 'income'
            );

        },

        error: (error) => {

          console.error(
            'Error loading income categories:',
            error
          );

          this.errorMessage =
            'No se pudieron cargar las categorías de ingresos.';
        }

      });
  }

  // =====================================================
  // CARGAR INGRESOS
  // =====================================================

  loadIncomes(): void {

    this.loading = true;

    this.errorMessage = '';

    this.incomeService
      .getIncomes()
      .subscribe({

        next: (response) => {

          this.incomes =
            response.data;

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Error loading incomes:',
            error
          );

          this.errorMessage =
            'No se pudieron cargar los ingresos.';

          this.loading = false;

        }

      });
  }

  // =====================================================
  // GUARDAR INGRESO
  // =====================================================

  saveIncome(): void {

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
        'Debes seleccionar una categoría de ingreso.';

      return;
    }

    // ---------------------------------------------------
    // COMPROBAR QUE LA CATEGORÍA SEA DE INGRESO
    // ---------------------------------------------------

    const selectedCategory =
      this.categories.find(
        category =>
          Number(category.id) ===
          Number(this.form.category_id)
      );

    if (
      !selectedCategory ||
      selectedCategory.type !== 'income'
    ) {

      this.errorMessage =
        'La categoría seleccionada no corresponde a un ingreso.';

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

      this.incomeService
        .createIncome(request)
        .subscribe({

          next: () => {

            this.successMessage =
              'Ingreso registrado correctamente.';

            this.resetForm();

            this.loadIncomes();

          },

          error: (error) => {

            console.error(
              'Error creating income:',
              error
            );

            this.errorMessage =
              error?.error?.message ??
              'No se pudo registrar el ingreso.';

            this.saving = false;

          }

        });

      return;
    }

    // ===================================================
    // ACTUALIZAR
    // ===================================================

    this.incomeService
      .updateIncome(
        this.editingId,
        request
      )
      .subscribe({

        next: () => {

          this.successMessage =
            'Ingreso actualizado correctamente.';

          this.resetForm();

          this.loadIncomes();

        },

        error: (error) => {

          console.error(
            'Error updating income:',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'No se pudo actualizar el ingreso.';

          this.saving = false;

        }

      });
  }

  // =====================================================
  // EDITAR INGRESO
  // =====================================================

  editIncome(
    income: Income
  ): void {

    this.clearMessages();

    this.editingId =
      income.id;

    this.form = {

      amount:
        Number(income.amount),

      description:
        income.description,

      date:
        income.date.substring(0, 10),

      category_id:
        Number(income.category_id)

    };

    window.scrollTo({

      top: 0,

      behavior: 'smooth'

    });
  }

  // =====================================================
  // ELIMINAR INGRESO
  // =====================================================

  deleteIncome(
    income: Income
  ): void {

    this.clearMessages();

    const confirmed =
      window.confirm(
        `¿Seguro que deseas eliminar el ingreso "${income.description}"?`
      );

    if (!confirmed) {
      return;
    }

    this.incomeService
      .deleteIncome(income.id)
      .subscribe({

        next: () => {

          this.successMessage =
            'Ingreso eliminado correctamente.';

          if (
            this.editingId ===
            income.id
          ) {

            this.resetForm();

          }

          this.loadIncomes();

        },

        error: (error) => {

          console.error(
            'Error deleting income:',
            error
          );

          this.errorMessage =
            'No se pudo eliminar el ingreso.';

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