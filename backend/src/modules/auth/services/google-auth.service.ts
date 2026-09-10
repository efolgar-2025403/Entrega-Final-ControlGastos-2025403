import {
  OAuth2Client,
  TokenPayload
} from 'google-auth-library';

/**
 * Verifica los ID tokens emitidos por
 * Google Identity Services.
 *
 * No almacena ni solicita credenciales de Google:
 * únicamente valida la identidad presentada por el
 * usuario contra las claves públicas de Google.
 */
export class GoogleAuthService {

  async verifyIdToken(
    idToken: string
  ): Promise<TokenPayload> {

    try {

      const clientId =
        process.env.GOOGLE_CLIENT_ID;

      if (!clientId) {
        throw new Error(
          'GOOGLE_CLIENT_ID no está configurado'
        );
      }

      const client =
        new OAuth2Client(clientId);

      /**
       * Google valida la firma, la expiración,
       * el emisor y que el audience corresponda
       * exactamente a nuestro GOOGLE_CLIENT_ID.
       *
       * Lanza un error si el token es inválido.
       */
      const ticket =
        await client.verifyIdToken({
          idToken,
          audience: clientId
        });

      const payload =
        ticket.getPayload();

      if (!payload) {
        throw new Error(
          'Token de Google no válido'
        );
      }

      if (payload.email_verified !== true) {
        throw new Error(
          'La cuenta de Google no tiene un correo verificado'
        );
      }

      if (!payload.email || !payload.sub) {
        throw new Error(
          'Google no proporcionó los datos necesarios'
        );
      }

      return payload;

    } catch (error) {

      /**
       * Los errores internos de google-auth-library
       * (firma incorrecta, token expirado, emisor
       * inválido, etc.) se traducen a un mensaje
       * controlado para no filtrar detalles al
       * frontend.
       */
      throw new Error(
        'La identidad de Google no pudo ser verificada. Inténtalo nuevamente.'
      );
    }
  }
}