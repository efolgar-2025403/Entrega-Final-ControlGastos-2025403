import { Response } from 'express';

import type {
  AuthenticatedRequest
} from '../../auth/middlewares/auth.middleware.js';

import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
} from '../services/expense.service.js';

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


/**
 * CREATE EXPENSE
 */
export async function createExpenseController(
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


    const expense = await createExpense(
      req.body,
      req.user.id
    );


    return res.status(201).json({
      success: true,
      data: expense
    });


  } catch (error) {

    if (error instanceof AppError) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    console.error(
      'Error creating expense:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'No se pudo registrar el gasto.'
    });

  }

}


/**
 * GET EXPENSES
 */
export async function getExpensesController(
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


    const expenses =
      await getExpenses(
        req.user.id
      );


    return res.status(200).json({
      success: true,
      data: expenses
    });


  } catch (error) {

    console.error(
      'Error getting expenses:',
      error
    );


    return res.status(500).json({
      success: false,
      message: 'Error getting expenses'
    });

  }

}


/**
 * GET EXPENSE BY ID
 */
export async function getExpenseByIdController(
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


    const id =
      getParamId(
        req.params.id
      );


    if (!id) {

      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID'
      });

    }


    const expense =
      await getExpenseById(
        id,
        req.user.id
      );


    if (!expense) {

      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });

    }


    return res.status(200).json({
      success: true,
      data: expense
    });


  } catch (error) {

    console.error(
      'Error getting expense:',
      error
    );


    return res.status(500).json({
      success: false,
      message: 'Error getting expense'
    });

  }

}


/**
 * UPDATE EXPENSE
 */
export async function updateExpenseController(
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


    const id =
      getParamId(
        req.params.id
      );


    if (!id) {

      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID'
      });

    }


    const expense =
      await updateExpense(
        id,
        req.body,
        req.user.id
      );


    if (!expense) {

      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });

    }


    return res.status(200).json({
      success: true,
      data: expense
    });


  } catch (error) {

    if (error instanceof AppError) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    console.error(
      'Error updating expense:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'No se pudo actualizar el gasto.'
    });

  }

}


/**
 * DELETE EXPENSE
 */
export async function deleteExpenseController(
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


    const id =
      getParamId(
        req.params.id
      );


    if (!id) {

      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID'
      });

    }


    const deleted =
      await deleteExpense(
        id,
        req.user.id
      );


    if (!deleted) {

      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });

    }


    return res.status(200).json({
      success: true,
      data: deleted
    });


  } catch (error) {

    console.error(
      'Error deleting expense:',
      error
    );


    return res.status(500).json({
      success: false,
      message: 'Error deleting expense'
    });

  }

}