import {
  CreateIncomeInput,
  Income,
  UpdateIncomeInput
} from '../models/income.model.js';

import {
  IncomeRepository,
  CreateIncomeData,
  UpdateIncomeData
} from '../repositories/income.repository.js';

import {
  CategoryRepository
} from '../../category/repositories/category.repository.js';

import { AppError } from '../../../common/app-error.js';


const incomeRepository = new IncomeRepository();

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
      'El monto del ingreso no es válido.'
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
      'Debes seleccionar una categoría de ingreso.'
    );
  }

  return { amount };
}


/**
 * Verifica que la categoría exista, pertenezca
 * al usuario y sea del tipo ingreso.
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

  if (category.type !== 'income') {
    throw new AppError(
      'La categoría seleccionada no corresponde a un ingreso.'
    );
  }
}


export async function getIncomes(
  userId: number
): Promise<Income[]> {

  return incomeRepository.findAll(userId);

}


export async function getIncomeById(
  id: string,
  userId: number
): Promise<Income | null> {

  return incomeRepository.findById(
    id,
    userId
  );

}


export async function createIncome(
  input: CreateIncomeInput,
  userId: number
): Promise<Income> {

  const { amount } =
    validateInput(input);

  await validateCategory(
    input.category_id,
    userId
  );

  const data: CreateIncomeData = {

    amount,

    description:
      input.description ?? null,

    date: input.date,

    category_id: input.category_id,

    user_id: userId

  };

  return incomeRepository.create(data);

}


export async function updateIncome(
  id: string,
  input: UpdateIncomeInput,
  userId: number
): Promise<Income | null> {

  const { amount } =
    validateInput(input);

  await validateCategory(
    input.category_id,
    userId
  );

  const data: UpdateIncomeData = {

    amount,

    description:
      input.description ?? null,

    date: input.date,

    category_id: input.category_id

  };

  return incomeRepository.update(
    id,
    userId,
    data
  );

}


export async function deleteIncome(
  id: string,
  userId: number
): Promise<boolean> {

  return incomeRepository.delete(
    id,
    userId
  );

}