import {
  HttpInterceptorFn
} from '@angular/common/http';

import {
  catchError,
  throwError
} from 'rxjs';

import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req,
  next
) => {

  const authService =
    inject(AuthService);

  const token =
    authService.getToken();

  if (!token) {
    return next(req);
  }

  const authenticatedRequest =
    req.clone({
      setHeaders: {
        Authorization:
          `Bearer ${token}`
      }
    });

  return next(
    authenticatedRequest
  ).pipe(

    catchError(error => {

      if (error.status === 401) {

        authService.logout(true);

      }

      return throwError(
        () => error
      );
    })
  );
};