import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  errorMessage = '';
  successMessage = '';
  loading = false;

  register(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.errorMessage =
        'Todos los campos son obligatorios.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage =
        'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage =
        'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;

    this.authService.register(
      this.name.trim(),
      this.email.trim(),
      this.password
    ).subscribe({

      next: () => {

        this.loading = false;

        this.successMessage =
          'Cuenta creada correctamente.';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },

      error: error => {

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          'No fue posible crear la cuenta.';
      }

    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword =
      !this.showConfirmPassword;
  }
}