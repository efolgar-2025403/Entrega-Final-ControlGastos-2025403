import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import {
  Observable,
  tap
} from 'rxjs';

interface AuthResponse {
  message: string;

  user: {
    id: number;
    name: string;
    email: string;
  };

  token: string;
}

interface MeResponse {
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface RefreshResponse {
  message: string;
  token: string;
}

interface JwtPayload {
  exp?: number;
  id?: number;
  name?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http =
    inject(HttpClient);

  private readonly router =
    inject(Router);

  private readonly apiUrl =
    'http://localhost:3000/api/auth';

  /**
   * Temporizador utilizado para cerrar
   * automáticamente la sesión cuando
   * el JWT llegue a su fecha de expiración.
   */
  private expirationTimer:
    ReturnType<typeof setTimeout> | null = null;

  /**
   * Evita realizar varios refresh
   * al mismo tiempo.
   */
  private refreshInProgress = false;

  /**
   * Eventos considerados como actividad
   * del usuario.
   */
  private readonly activityEvents = [
    'click',
    'keydown',
    'scroll',
    'touchstart'
  ];

  constructor() {

    this.initializeSession();

    this.registerActivityListeners();
  }

  /**
   * Inicia sesión.
   *
   * El tiempo de expiración del JWT
   * es decidido completamente por el backend
   * mediante JWT_EXPIRES_IN.
   */
  login(
    email: string,
    password: string
  ): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      {
        email,
        password
      }
    ).pipe(
      tap(response => {

        this.saveSession(response);
      })
    );
  }

  /**
   * Inicia sesión con un ID token de Google
   * verificado por el backend.
   */
  loginWithGoogle(
    credential: string
  ): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/google`,
      {
        credential
      }
    ).pipe(
      tap(response => {

        this.saveSession(response);
      })
    );
  }

  /**
   * Almacena la sesión devuelta por el backend
   * y programa el cierre automático según el
   * exp del JWT.
   */
  private saveSession(
    response: AuthResponse
  ): void {

    localStorage.setItem(
      'control-gastos-token',
      response.token
    );

    localStorage.setItem(
      'control-gastos-user',
      JSON.stringify(response.user)
    );

    localStorage.removeItem(
      'control-gastos-session-expired'
    );

    this.startExpirationTimer();
  }

  /**
   * Registra un nuevo usuario.
   */
  register(
    name: string,
    email: string,
    password: string
  ): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/register`,
      {
        name,
        email,
        password
      }
    );
  }

  /**
   * Consulta la información del usuario
   * autenticado.
   */
  me(): Observable<MeResponse> {

    return this.http.get<MeResponse>(
      `${this.apiUrl}/me`
    );
  }

  /**
   * Solicita al backend un nuevo JWT.
   *
   * El nuevo tiempo de expiración también
   * viene determinado por JWT_EXPIRES_IN.
   */
  refreshToken(): Observable<RefreshResponse> {

    return this.http.post<RefreshResponse>(
      `${this.apiUrl}/refresh`,
      {}
    ).pipe(

      tap(response => {

        this.updateToken(
          response.token
        );

        /**
         * El nuevo JWT tiene un nuevo exp,
         * por lo que se vuelve a programar
         * el cierre automático.
         */
        this.startExpirationTimer();
      })
    );
  }

  /**
   * Obtiene el JWT almacenado.
   */
  getToken(): string | null {

    return localStorage.getItem(
      'control-gastos-token'
    );
  }

  /**
   * Obtiene el usuario almacenado.
   */
  getUser(): {
    id: number;
    name: string;
    email: string;
  } | null {

    const user =
      localStorage.getItem(
        'control-gastos-user'
      );

    if (!user) {
      return null;
    }

    try {

      return JSON.parse(user);

    } catch {

      return null;
    }
  }

  /**
   * Actualiza el JWT almacenado.
   *
   * Si la sesión ya fue cerrada mientras un refresh
   * estaba en vuelo, no se reintroduce el token.
   */
  updateToken(
    token: string
  ): void {

    if (!this.getToken()) {
      return;
    }

    localStorage.setItem(
      'control-gastos-token',
      token
    );
  }

  /**
   * Comprueba si existe una sesión válida.
   *
   * La validación se realiza utilizando
   * la fecha de expiración contenida
   * dentro del JWT.
   */
  isAuthenticated(): boolean {

    const token =
      this.getToken();

    if (!token) {
      return false;
    }

    const payload =
      this.decodeToken(token);

    if (!payload?.exp) {

      this.logout(false);

      return false;
    }

    const expirationTime =
      payload.exp * 1000;

    if (
      Date.now() >= expirationTime
    ) {

      this.logout(true);

      return false;
    }

    return true;
  }

  /**
   * Cierra la sesión del usuario.
   */
  logout(
    expired: boolean = false
  ): void {

    this.clearExpirationTimer();

    this.refreshInProgress = false;

    localStorage.removeItem(
      'control-gastos-token'
    );

    localStorage.removeItem(
      'control-gastos-user'
    );

    if (expired) {

      localStorage.setItem(
        'control-gastos-session-expired',
        'Su sesión ha expirado por inactividad. Por seguridad, debe iniciar sesión nuevamente.'
      );
    }

    this.router.navigate([
      '/login'
    ]);
  }

  /**
   * Inicializa una sesión existente
   * cuando se carga nuevamente la aplicación.
   */
  private initializeSession(): void {

    const token =
      this.getToken();

    if (!token) {
      return;
    }

    const payload =
      this.decodeToken(token);

    if (!payload?.exp) {

      this.logout(false);

      return;
    }

    const expirationTime =
      payload.exp * 1000;

    /**
     * Si el JWT ya expiró, se cierra
     * inmediatamente la sesión.
     */
    if (
      Date.now() >= expirationTime
    ) {

      this.logout(true);

      return;
    }

    /**
     * El temporizador se basa únicamente
     * en el exp del JWT.
     */
    this.startExpirationTimer();
  }

  /**
   * Registra los eventos de actividad
   * del usuario.
   */
  private registerActivityListeners(): void {

    this.activityEvents.forEach(
      eventName => {

        window.addEventListener(
          eventName,
          () => {

            this.handleUserActivity();

          },
          {
            passive: true
          }
        );
      }
    );
  }

  /**
   * Procesa una interacción del usuario.
   *
   * Cada interacción solicita al backend
   * un nuevo JWT.
   */
  private handleUserActivity(): void {

    const token =
      this.getToken();

    if (!token) {
      return;
    }

    /**
     * Si el JWT ya expiró, no se intenta
     * renovar la sesión.
     */
    const payload =
      this.decodeToken(token);

    if (!payload?.exp) {

      this.logout(true);

      return;
    }

    const expirationTime =
      payload.exp * 1000;

    if (
      Date.now() >= expirationTime
    ) {

      this.logout(true);

      return;
    }

    /**
     * Se solicita un nuevo JWT.
     *
     * El backend decide nuevamente
     * cuánto tiempo tendrá de duración.
     */
    this.requestTokenRefresh();
  }

  /**
   * Solicita la renovación del JWT.
   */
  private requestTokenRefresh(): void {

    if (this.refreshInProgress) {
      return;
    }

    this.refreshInProgress = true;

    this.refreshToken().subscribe({

      next: () => {

        this.refreshInProgress = false;

      },

      error: () => {

        this.refreshInProgress = false;

      }
    });
  }

  /**
   * Programa el cierre automático
   * utilizando exclusivamente el exp
   * del JWT actual.
   */
  private startExpirationTimer(): void {

    this.clearExpirationTimer();

    const token =
      this.getToken();

    if (!token) {
      return;
    }

    const payload =
      this.decodeToken(token);

    if (!payload?.exp) {

      this.logout(true);

      return;
    }

    /**
     * exp viene expresado en segundos
     * desde Unix Epoch.
     */
    const expirationTime =
      payload.exp * 1000;

    /**
     * Tiempo restante hasta que expire
     * exactamente el JWT.
     */
    const remainingTime =
      expirationTime - Date.now();

    if (remainingTime <= 0) {

      this.logout(true);

      return;
    }

    /**
     * Cuando llegue exactamente la fecha
     * de expiración del JWT, se cierra
     * automáticamente la sesión.
     *
     * No depende de otra interacción
     * del usuario.
     */
    this.expirationTimer =
      setTimeout(() => {

        this.checkTokenExpiration();

      }, remainingTime);
  }

  /**
   * Comprueba nuevamente la expiración
   * cuando llega el temporizador.
   */
  private checkTokenExpiration(): void {

    const token =
      this.getToken();

    if (!token) {
      return;
    }

    const payload =
      this.decodeToken(token);

    if (!payload?.exp) {

      this.logout(true);

      return;
    }

    const expirationTime =
      payload.exp * 1000;

    if (
      Date.now() >= expirationTime
    ) {

      this.logout(true);

      return;
    }

    /**
     * Si por alguna razón el navegador
     * ejecutó el temporizador antes de tiempo,
     * se vuelve a calcular el tiempo restante.
     */
    this.startExpirationTimer();
  }

  /**
   * Cancela el temporizador actual.
   */
  private clearExpirationTimer(): void {

    if (
      this.expirationTimer !== null
    ) {

      clearTimeout(
        this.expirationTimer
      );

      this.expirationTimer = null;
    }
  }

  /**
   * Decodifica el payload del JWT.
   *
   * Solo se utiliza para obtener la fecha
   * de expiración y otros datos públicos.
   */
  private decodeToken(
    token: string
  ): JwtPayload | null {

    try {

      const parts =
        token.split('.');

      if (parts.length !== 3) {
        return null;
      }

      const payload =
        JSON.parse(
          atob(
            parts[1]
              .replace(/-/g, '+')
              .replace(/_/g, '/')
          )
        );

      return payload;

    } catch {

      return null;
    }
  }
}