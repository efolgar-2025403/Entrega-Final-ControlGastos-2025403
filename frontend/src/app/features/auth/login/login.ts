import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild,
  inject
} from '@angular/core';

import {
  filter
} from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  GoogleAuthService
} from '../../../core/services/google-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit, AfterViewInit {

  private readonly authService =
    inject(AuthService);

  private readonly googleAuthService =
    inject(GoogleAuthService);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly router =
    inject(Router);

  @ViewChild('googleButton', {
    static: false
  })
  googleButtonRef?: ElementRef<HTMLDivElement>;

  email = '';
  password = '';

  showPassword = false;

  errorMessage = '';
  loading = false;

  /**
   * Estado de la opción de inicio de sesión
   * con Google.
   */
  googleLoading = true;
  googleAvailable = false;
  googleError = '';

  ngOnInit(): void {

    const sessionExpired =
      localStorage.getItem(
        'control-gastos-session-expired'
      );

    if (sessionExpired) {

      this.errorMessage =
        sessionExpired;

      localStorage.removeItem(
        'control-gastos-session-expired'
      );
    }

    this.setupGoogleLogin();
  }

  ngAfterViewInit(): void {

    this.renderGoogleButton();
  }

  login(): void {

    this.errorMessage = '';

    if (
      !this.email.trim() ||
      !this.password
    ) {

      this.errorMessage =
        'Ingresa tu correo y contraseña.';

      return;
    }

    this.loading = true;

    this.authService.login(
      this.email.trim(),
      this.password
    ).subscribe({

      next: () => {

        this.loading = false;

        this.router.navigate([
          '/dashboard'
        ]);
      },

      error: error => {

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          'Correo o contraseña incorrectos.';
      }
    });
  }

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;
  }

  /**
   * Prepara la opción de Google:
   * obtiene el clientId desde el backend,
   * carga GIS y renderiza el botón oficial.
   */
  private setupGoogleLogin(): void {

    this.googleAuthService.credential$
      .pipe(
        filter(
          (credential): credential is string =>
            !!credential
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(credential => {

        this.loginWithGoogle(credential);
      });

    this.googleAuthService
      .fetchConfig()
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: config => {

          if (!config?.clientId) {

            this.googleLoading = false;
            this.googleAvailable = false;
            return;
          }

          this.googleAuthService
            .loadScript()
            .then(() => {

              this.googleAuthService.init(
                config.clientId
              );

              this.googleLoading = false;
              this.googleAvailable = true;

              this.renderGoogleButton();
            })
            .catch(() => {

              this.googleLoading = false;
              this.googleAvailable = false;

              this.googleError =
                'No fue posible cargar el inicio de sesión con Google.';
            });
        },

        error: () => {

          this.googleLoading = false;
          this.googleAvailable = false;

          this.googleError =
            'No fue posible cargar el inicio de sesión con Google.';
        }
      });
  }

  /**
   * Inserta el botón de Google una vez que el
   * contenedor existe y el servicio está listo.
   */
  private renderGoogleButton(): void {

    if (
      !this.googleAvailable ||
      !this.googleButtonRef?.nativeElement
    ) {
      return;
    }

    this.googleAuthService.renderButton(
      this.googleButtonRef.nativeElement
    );
  }

  /**
   * Envía el ID token de Google al backend
   * y navega al dashboard si es válido.
   */
  private loginWithGoogle(
    credential: string
  ): void {

    this.errorMessage = '';
    this.loading = true;

    this.authService
      .loginWithGoogle(credential)
      .subscribe({

        next: () => {

          this.loading = false;

          this.router.navigate([
            '/dashboard'
          ]);
        },

        error: error => {

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'No fue posible iniciar sesión con Google.';
        }
      });
  }
}