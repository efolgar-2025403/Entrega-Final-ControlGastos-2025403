import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name?: string;
    email?: string;
    [key: string]: any;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {

  const authHeader =
    req.headers['authorization'];

  const token =
    authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message:
        'Acceso denegado, token no proporcionado'
    });
  }

  const jwtSecret =
    process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      message:
        'JWT_SECRET no está configurado en el servidor'
    });
  }

  jwt.verify(
    token,
    jwtSecret,
    (err, decoded) => {

      if (err) {

        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            message:
              'La sesión ha expirado, por favor vuelve a iniciar sesión'
          });
        }

        return res.status(403).json({
          message:
            'Token no válido'
        });
      }

      req.user = decoded as {
        id: number;
        name?: string;
        email?: string;
        [key: string]: any;
      };

      next();
    }
  );
};