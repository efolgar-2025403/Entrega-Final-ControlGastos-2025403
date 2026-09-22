import { Request, Response } from 'express';

import { AuthService } from '../services/auth.service.js';

import {
  AuthenticatedRequest
} from '../middlewares/auth.middleware.js';

export class AuthController {

  private readonly service =
    new AuthService();

  register = async (
    req: Request,
    res: Response
  ) => {

    try {

      const user =
        await this.service.register(
          req.body
        );

      res.status(201).json({
        message:
          'Usuario registrado correctamente',
        user
      });

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : 'Error al registrar usuario';

      res.status(400).json({
        message
      });
    }
  };


  login = async (
    req: Request,
    res: Response
  ) => {

    try {

      const result =
        await this.service.login(
          req.body
        );

      res.status(200).json({
        message:
          'Inicio de sesión correcto',
        user: result.user,
        token: result.token
      });

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : 'Error al iniciar sesión';

      res.status(401).json({
        message
      });
    }
  };


  googleLogin = async (
    req: Request,
    res: Response
  ) => {

    try {

      const result =
        await this.service.loginWithGoogle(
          req.body
        );

      res.status(200).json({
        message:
          'Inicio de sesión correcto',
        user: result.user,
        token: result.token
      });

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : 'Error al iniciar sesión con Google';

      res.status(401).json({
        message
      });
    }
  };


  /**
   * Expone el GOOGLE_CLIENT_ID público al
   * frontend.
   *
   * No es un secreto: Google lo requiere en el
   * navegador para renderizar el botón.
   */
  getGoogleConfig = (
    _req: Request,
    res: Response
  ) => {

    res.status(200).json({
      clientId:
        process.env.GOOGLE_CLIENT_ID || ''
    });
  };


  refresh = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      if (!req.user) {
        return res.status(401).json({
          message:
            'Usuario no autenticado'
        });
      }

      const token =
        this.service.refreshToken({
          id: req.user.id,
          name: req.user.name || '',
          email: req.user.email || ''
        });

      res.status(200).json({
        message:
          'Sesión renovada correctamente',
        token
      });

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : 'Error al renovar la sesión';

      res.status(401).json({
        message
      });
    }
  };
}