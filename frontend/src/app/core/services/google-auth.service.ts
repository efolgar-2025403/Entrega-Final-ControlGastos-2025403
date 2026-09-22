import {
  Injectable,
  NgZone,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  Subject
} from 'rxjs';

declare const google: any;

export interface GoogleConfigResponse {
  clientId: string;
}

/**
 * Envoltorio del API de Google Identity Services.
 *
 * - Carga dinámicamente el script de Google.
 * - Obtiene el GOOGLE_CLIENT_ID desde el backend
 *   (no se hardcodea ningún valor en el frontend).
 * - Renderiza el botón oficial "Continuar con Google"
 *   y emite el credential (ID token) recibido.
 */
@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {

  private readonly http =
    inject(HttpClient);

  private readonly ngZone =
    inject(NgZone);

  private readonly apiUrl =
    'http://localhost:3000/api/auth';

  /**
   * Emite el credential (ID token) cuando Google
   * completa exitosamente la selección de cuenta.
   *
   * Es un Subject (no BehaviorSubject): no se replica
   * el último credential en cada nueva suscripción,
   * evitando que al volver a /login se reintente el
   * inicio de sesión automáticamente después de cerrar
   * sesión (el ID token de Google sigue siendo válido
   * durante ~1 hora tras el logout).
   */
  private readonly credentialSubject =
    new Subject<string | null>();

  readonly credential$ =
    this.credentialSubject.asObservable();

  private clientId: string | null = null;

  private initialized = false;

  private scriptPromise: Promise<void> | null = null;

  /**
   * Obtiene la configuración desde el backend.
   */
  fetchConfig(): Observable<GoogleConfigResponse> {

    return this.http.get<GoogleConfigResponse>(
      `${this.apiUrl}/google/config`
    );
  }

  /**
   * Carga el script de Google Identity Services
   * una única vez.
   */
  loadScript(): Promise<void> {

    if (this.scriptPromise) {
      return this.scriptPromise;
    }

    if (
      typeof google !== 'undefined' &&
      google?.accounts?.id
    ) {

      this.scriptPromise =
        Promise.resolve();

      return this.scriptPromise;
    }

    this.scriptPromise =
      new Promise<void>((resolve, reject) => {

        const script =
          document.createElement('script');

        script.src =
          'https://accounts.google.com/gsi/client';

        script.async = true;
        script.defer = true;

        script.onload =
          () => resolve();

        script.onerror =
          () => reject(
            new Error(
              'No fue posible cargar Google Identity Services'
            )
          );

        document.head.appendChild(script);
      });

    return this.scriptPromise;
  }

  /**
   * Inicializa GIS con el clientId obtenido
   * del backend.
   */
  init(clientId: string): void {

    if (this.initialized) {
      return;
    }

    this.clientId = clientId;

    google.accounts.id.initialize({
      client_id: clientId,

      callback: (response: {
        credential?: string;
      }) => {

        /**
         * El callback de Google se ejecuta fuera
         * de Angular, por lo que se reintroduce
         * dentro del ngZone.
         */
        this.ngZone.run(() => {

          this.credentialSubject.next(
            response?.credential || null
          );
        });
      }
    });

    this.initialized = true;
  }

  /**
   * Renderiza el botón oficial de Google dentro
   * de un contenedor del template.
   */
  renderButton(
    container: HTMLElement
  ): void {

    if (
      !this.clientId ||
      !google?.accounts?.id
    ) {
      return;
    }

    google.accounts.id.renderButton(
      container,
      {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: 300
      }
    );
  }
}