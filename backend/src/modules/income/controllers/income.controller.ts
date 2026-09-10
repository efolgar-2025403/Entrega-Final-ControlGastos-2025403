import { Response } from 'express';

import {
  AuthenticatedRequest
} from '../../auth/middlewares/auth.middleware.js';

import {
  createIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome
} from '../services/income.service.js';

import {
  AppError,
  isValidNumericId
} from '../../../common/app-error.js';


function getParamId(
  id: string | string[]
): string | null {

  if (Array.isArray(id)) {
    return null;
  }

  if (!isValidNumericId(id)) {
    return null;
  }

  return id;
}


function handleError(
  res: Response,
  error: unknown,
  fallback: string
): Response {

  if (error instanceof AppError) {
    return res.status(error.status).json({
      success: false,
      message: error.message
    });
  }

  console.error(
    'Error interno en ingresos:',
    error
  );

  return res.status(500).json({
    success: false,
    message: fallback
  });
}


export async function createIncomeController(
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> {

  try {

    if (!req.user) {

      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });

    }

    const income = await createIncome(
      req.body,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      data: income
    });

  } catch (error) {

    return handleError(
      res,
      error,
      'No se pudo registrar el ingreso.'
    );

  }

}


export async function getIncomesController(
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> {

  try {

    if (!req.user) {

      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });

    }

    const incomes = await getIncomes(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: incomes
    });

  } catch (error) {

    return handleError(
      res,
      error,
      'Error al obtener los ingresos.'
    );

  }

}


export async function getIncomeByIdController(
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> {

  try {

    if (!req.user) {

      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });

    }

    const id = getParamId(
      req.params.id
    );

    if (!id) {

      return res.status(400).json({
        success: false,
        message: 'Invalid income ID'
      });

    }

    const income = await getIncomeById(
      id,
      req.user.id
    );

    if (!income) {

      return res.status(404).json({
        success: false,
        message: 'Income not found'
      });

    }

    return res.status(200).json({
      success: true,
      data: income
    });

  } catch (error) {

    return handleError(
      res,
      error,
      'Error al obtener el ingreso.'
    );

  }

}


export async function updateIncomeController(
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> {

  try {

    if (!req.user) {

      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });

    }

    const id = getParamId(
      req.params.id
    );

    if (!id) {

      return res.status(400).json({
        success: false,
        message: 'Invalid income ID'
      });

    }

    const income = await updateIncome(
      id,
      req.body,
      req.user.id
    );

    if (!income) {

      return res.status(404).json({
        success: false,
        message: 'Income not found'
      });

    }

    return res.status(200).json({
      success: true,
      data: income
    });

  } catch (error) {

    return handleError(
      res,
      error,
      'No se pudo actualizar el ingreso.'
    );

  }

}


export async function deleteIncomeController(
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> {

  try {

    if (!req.user) {

      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });

    }

    const id = getParamId(
      req.params.id
    );

    if (!id) {

      return res.status(400).json({
        success: false,
        message: 'Invalid income ID'
      });

    }

    const deleted = await deleteIncome(
      id,
      req.user.id
    );

    if (!deleted) {

      return res.status(404).json({
        success: false,
        message: 'Income not found'
      });

    }

    return res.status(200).json({
      success: true,
      data: deleted
    });

  } catch (error) {

    return handleError(
      res,
      error,
      'No se pudo eliminar el ingreso.'
    );

  }

}