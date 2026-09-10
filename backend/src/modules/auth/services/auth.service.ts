import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {
  GoogleLoginDTO,
  LoginUserDTO,
  RegisterUserDTO
} from '../models/user.model.js';

import { AuthRepository } from '../repositories/auth.repository.js';

import { GoogleAuthService } from './google-auth.service.js';

export class AuthService {

  private readonly repository =
    new AuthRepository();

  private readonly googleAuth =
    new GoogleAuthService();

  async register(data: RegisterUserDTO) {

    const name =
      data.name.trim();

    const email =
      data.email.trim().toLowerCase();

    if (!name || !email || !data.password) {
      throw new Error(
        'Todos los campos son obligatorios'
      );
    }

    if (name.length > 100) {
      throw new Error(
        'El nombre no puede superar los 100 caracteres'
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      throw new Error(
        'El correo electrónico no es válido'
      );
    }

    if (data.password.length < 6) {
      throw new Error(
        'La contraseña debe tener al menos 6 caracteres'
      );
    }

    const existingUser =
      await this.repository.findByEmail(email);

    if (existingUser) {
      throw new Error(
        'Ya existe un usuario con ese correo'
      );
    }

    const passwordHash =
      await bcrypt.hash(
        data.password,
        10
      );

    const user =
      await this.repository.create(
        name,
        email,
        passwordHash
      );

    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  }

  async login(data: LoginUserDTO) {

    const email =
      data.email.trim().toLowerCase();

    if (!email || !data.password) {
      throw new Error(
        'Correo y contraseña son obligatorios'
      );
    }

    const user =
      await this.repository.findByEmail(email);

    if (!user) {
      throw new Error(
        'Correo o contraseña incorrectos'
      );
    }

    if (!user.password_hash) {
      throw new Error(
        'Correo o contraseña incorrectos'
      );
    }

    const validPassword =
      await bcrypt.compare(
        data.password,
        user.password_hash
      );

    if (!validPassword) {
      throw new Error(
        'Correo o contraseña incorrectos'
      );
    }

    const token =
      this.signToken({
        id: user.id,
        name: user.name,
        email: user.email
      });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    };
  }

  /**
   * Inicia sesión con una cuenta de Google.
   *
   * El backend valida el ID token contra Google
   * antes de autenticar al usuario y de emitir
   * el JWT interno de CONTROL-GASTOS.
   */
  async loginWithGoogle(data: GoogleLoginDTO) {

    /**
     * Nunca se confía en los datos enviados
     * por el frontend (correo, nombre, etc.);
     * la identidad proviene del token verificado.
     */
    const payload =
      await this.googleAuth.verifyIdToken(
        data.credential
      );

    const email =
      (payload.email as string)
        .trim()
        .toLowerCase();

    const googleSub =
      payload.sub as string;

    const name =
      payload.name ||
      email.split('@')[0] ||
      'Usuario';

    const picture =
      payload.picture || null;

    let user =
      await this.repository.findByEmail(email);

    if (!user) {

      /**
       * Se comprueba que el google_sub no esté
       * asociado a otro usuario existente
       * (evita duplicados y conflictos).
       */
      const userBySub =
        await this.repository.findByGoogleSub(
          googleSub
        );

      if (userBySub) {
        throw new Error(
          'Ya existe otro usuario vinculado a esa cuenta de Google'
        );
      }

      user =
        await this.repository.createGoogleUser(
          name,
          email,
          googleSub,
          picture
        );
    } else {

      /**
       * La cuenta de Google ya existe.
       */
      if (
        user.google_sub &&
        user.google_sub !== googleSub
      ) {
        throw new Error(
          'La cuenta de Google no coincide con la vinculada a este correo'
        );
      }

      /**
       * Si el correo ya existía por registro
       * local (con contraseña), se vincula la
       * cuenta de Google al mismo usuario.
       */
      if (!user.google_sub) {
        user =
          await this.repository.linkGoogleAccount(
            user.id,
            googleSub,
            picture
          );
      }
    }

    const token =
      this.signToken({
        id: user.id,
        name: user.name,
        email: user.email
      });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    };
  }

  /**
   * Genera el JWT de la sesión.
   *
   * El tiempo de expiración se obtiene desde
   * JWT_EXPIRES_IN del archivo .env.
   *
   * Por defecto se utilizan 20 minutos.
   */
  private signToken(user: {
    id: number;
    name: string;
    email: string;
  }): string {

    const secret =
      process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        'JWT_SECRET no está configurado'
      );
    }

    const expiresIn =
      process.env.JWT_EXPIRES_IN || '2h';

    return jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email
      },
      secret,
      {
        expiresIn: expiresIn as any
      }
    );
  }

  /**
   * Renueva el JWT de una sesión activa.
   */
  refreshToken(user: {
    id: number;
    name: string;
    email: string;
  }): string {

    return this.signToken(user);
  }
}