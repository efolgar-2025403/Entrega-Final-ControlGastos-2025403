/**
 * Error de dominio con código HTTP explícito.
 *
 * Permite diferenciar errores de validación del
 * negocio (400/404) de fallos inesperados del
 * servidor (500) sin filtrar detalles internos.
 */
export class AppError extends Error {

  readonly status: number;

  constructor(
    message: string,
    status = 400
  ) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

/**
 * Indica que un identificador recibido no tiene
 * el formato numérico esperado en la ruta.
 */
export function isValidNumericId(
  value: string
): boolean {

  return /^\d+$/.test(value);
}