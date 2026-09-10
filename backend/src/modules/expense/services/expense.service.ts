import {
  CreateExpenseInput,
  Expense,
  UpdateExpenseInput
} from '../models/expense.model.js';

import {
  ExpenseRepository,
  CreateExpenseData,
  UpdateExpenseData
} from '../repositories/expense.repository.js';

import {
  CategoryRepository
} from '../../category/repositories/category.repository.js';

import { AppError } from '../../../common/app-error.js';


const expenseRepository = new ExpenseRepository();

const categoryRepository = new CategoryRepository();


/**
 * Valida que la fecha tenga formato AAAA-MM-DD
 * y sea una fecha real de calendario.
 */
function isValidDate(
  date: string
): boolean {

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return false;
  }

  const parsed =
    new Date(`${date}T00:00:00Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
}


/**
 * Valida monto, descripción, fecha y categoría
 * antes de tocar la base de datos.
 */
function validateInput(input: {
  amount: unknown;
  description?: string | null;
  date: string;
  category_id: string | number;
}): { amount: number } {

  const amount =
    Number(input.amount);

  if (!Number.isFinite(amount)) {
    throw new AppError(
      'El monto del gasto no es válido.'
    );
  }

  if (amount <= 0) {
    throw new AppError(
      'El monto debe ser mayor que cero.'
    );
  }

  if (
    typeof input.description === 'string' &&
    input.description.length > 255
  ) {
    throw new AppError(
      'La descripción no puede superar los 255 caracteres.'
    );
  }

  if (
    input.description !== undefined &&
    input.description !== null &&
    typeof input.description !== 'string'
  ) {
    throw new AppError(
      'La descripción debe ser un texto válido.'
    );
  }

  if (!isValidDate(input.date)) {
    throw new AppError(
      'La fecha no es válida. Usa el formato AAAA-MM-DD.'
    );
  }

  const [y, m, d] =
    input.date.split('-').map(Number);

  const parsed =
    new Date(y, m - 1, d);

  const now =
    new Date();

  const todayStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

  const weekStart =
    new Date(todayStart);

  weekStart.setDate(
    weekStart.getDate() - 7
  );

  if (parsed > todayStart) {
    throw new AppError(
      'La fecha no puede ser posterior a hoy.'
    );
  }

  if (parsed < weekStart) {
    throw new AppError(
      'La fecha puede ser la de hoy o de hasta una semana atrás.'
    );
  }

  if (
    !Number.isInteger(Number(input.category_id)) ||
    Number(input.category_id) <= 0
  ) {
    throw new AppError(
      'Debes seleccionar una categoría de gasto.'
    );
  }

  return { amount };
}


/**
 * Verifica que la categoría exista, pertenezca
 * al usuario y sea del tipo gasto.
 */
async function validateCategory(
  categoryId: string | number,
  userId: number
): Promise<void> {

  const category =
    await categoryRepository.findById(
      Number(categoryId),
      userId
    );

  if (!category) {
    throw new AppError(
      'La categoría seleccionada no existe.',
      404
    );
  }

  if (category.type !== 'expense') {
    throw new AppError(
      'La categoría seleccionada no corresponde a un gasto.'
    );
  }

}


export async function getExpenses(
  userId: number
): Promise<Expense[]> {

  return expenseRepository.findAll(userId);

}


export async function getExpenseById(
  id: string,
  userId: number
): Promise<Expense | null> {

  return expenseRepository.findById(
    id,
    userId
  );

}


/**
 * Crear un nuevo gasto.
 *
 * Antes de guardar el gasto se comprueba
 * que el usuario tenga suficiente saldo disponible.
 */
export async function createExpense(
  input: CreateExpenseInput,
  userId: number
): Promise<Expense> {

  const { amount } =
    validateInput(input);

  await validateCategory(
    input.category_id,
    userId
  );


  const availableBalance =
    await expenseRepository.getAvailableBalance(
      userId
    );


  if (amount > availableBalance) {

    throw new AppError(
      `Saldo insuficiente. ` +
      `Disponible: Q${availableBalance.toFixed(2)}. ` +
      `Gasto solicitado: Q${amount.toFixed(2)}.`
    );

  }


  const data: CreateExpenseData = {

    amount,

    description:
      input.description ?? null,

    date: input.date,

    category_id:
      input.category_id,

    user_id:
      userId

  };


  return expenseRepository.create(
    data
  );

}


/**
 * Actualizar un gasto existente.
 *
 * Al editar se excluye el gasto actual
 * del cálculo para evitar contarlo dos veces.
 */
export async function updateExpense(
  id: string,
  input: UpdateExpenseInput,
  userId: number
): Promise<Expense | null> {

  const { amount } =
    validateInput(input);

  await validateCategory(
    input.category_id,
    userId
  );


  const existingExpense =
    await expenseRepository.findById(
      id,
      userId
    );


  if (!existingExpense) {
    return null;
  }


  const availableBalance =
    await expenseRepository
      .getAvailableBalanceForUpdate(
        id,
        userId
      );


  if (amount > availableBalance) {

    throw new AppError(
      `Saldo insuficiente. ` +
      `Disponible para este gasto: ` +
      `Q${availableBalance.toFixed(2)}. ` +
      `Gasto solicitado: Q${amount.toFixed(2)}.`
    );

  }


  const data: UpdateExpenseData = {

    amount,

    description:
      input.description ?? null,

    date:
      input.date,

    category_id:
      input.category_id

  };


  return expenseRepository.update(
    id,
    userId,
    data
  );

}


export async function deleteExpense(
  id: string,
  userId: number
): Promise<boolean> {

  return expenseRepository.delete(
    id,
    userId
  );

}