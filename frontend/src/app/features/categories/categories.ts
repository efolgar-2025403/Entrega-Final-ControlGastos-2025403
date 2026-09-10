import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  Category,
  CategoryService,
  CategoryType
} from '../../core/services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.scss'
})
export class Categories implements OnInit {

  private readonly categoryService = inject(CategoryService);

  categories: Category[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  editingId: number | null = null;

  form: {
    name: string;
    description: string;
    type: CategoryType;
  } = {
    name: '',
    description: '',
    type: 'expense'
  };

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {

    this.loading = true;
    this.errorMessage = '';

    this.categoryService.getCategories().subscribe({

      next: (response) => {

        this.categories = response.data;

        this.loading = false;
      },

      error: (error) => {

        console.error(
          'Error loading categories:',
          error
        );

        this.errorMessage =
          'No se pudieron cargar las categorías.';

        this.loading = false;
      }
    });
  }

  saveCategory(): void {

    this.clearMessages();

    const name = this.form.name.trim();
    const description =
      this.form.description.trim();

    if (!name) {

      this.errorMessage =
        'El nombre de la categoría es obligatorio.';

      return;
    }

    if (
      this.form.type !== 'expense' &&
      this.form.type !== 'income'
    ) {

      this.errorMessage =
        'Selecciona si la categoría será para gastos o ingresos.';

      return;
    }

    this.saving = true;

    const request = {
      name,
      description: description || undefined,
      type: this.form.type
    };

    if (this.editingId === null) {

      this.categoryService
        .createCategory(request)
        .subscribe({

          next: () => {

            this.successMessage =
              'Categoría creada correctamente.';

            this.resetForm();
            this.loadCategories();
          },

          error: (error) => {

            console.error(
              'Error creating category:',
              error
            );

            this.errorMessage =
              error?.error?.message ??
              'No se pudo crear la categoría.';

            this.saving = false;
          }
        });

      return;
    }

    this.categoryService
      .updateCategory(
        this.editingId,
        request
      )
      .subscribe({

        next: () => {

          this.successMessage =
            'Categoría actualizada correctamente.';

          this.resetForm();
          this.loadCategories();
        },

        error: (error) => {

          console.error(
            'Error updating category:',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'No se pudo actualizar la categoría.';

          this.saving = false;
        }
      });
  }

  editCategory(category: Category): void {

    this.clearMessages();

    this.editingId = category.id;

    this.form = {
      name: category.name,
      description: category.description ?? '',
      type: category.type
    };

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  deleteCategory(category: Category): void {

    this.clearMessages();

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar la categoría "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.categoryService
      .deleteCategory(category.id)
      .subscribe({

        next: () => {

          this.successMessage =
            'Categoría eliminada correctamente.';

          if (
            this.editingId === category.id
          ) {
            this.resetForm();
          }

          this.loadCategories();
        },

        error: (error) => {

          console.error(
            'Error deleting category:',
            error
          );

          this.errorMessage =
            'No se pudo eliminar la categoría. Puede que tenga gastos o ingresos asociados.';
        }
      });
  }

  cancelEdit(): void {

    this.resetForm();
    this.clearMessages();
  }

  resetForm(): void {

    this.form = {
      name: '',
      description: '',
      type: 'expense'
    };

    this.editingId = null;
    this.saving = false;
  }

  clearMessages(): void {

    this.errorMessage = '';
    this.successMessage = '';
  }

  getCategoryTypeLabel(
    type: CategoryType
  ): string {

    return type === 'expense'
      ? 'Gasto'
      : 'Ingreso';
  }
}