import { pool } from '../../../config/database.js';
import { Expense } from '../models/expense.model.js';

export interface CreateExpenseData {
  amount: number;
  description?: string | null;
  date: string;
  category_id: string;
  user_id: number;
}

export interface UpdateExpenseData {
  amount: number;
  description?: string | null;
  date: string;
  category_id: string;
}

export class ExpenseRepository {

  async findAll(userId: number): Promise<Expense[]> {
    const result = await pool.query<Expense>(
      `
      SELECT
        id,
        amount,
        description,
        date,
        category_id,
        created_at,
        updated_at
      FROM expenses
      WHERE user_id = $1
      ORDER BY date DESC, id DESC
      `,
      [userId]
    );

    return result.rows;
  }


  async findById(
    id: string,
    userId: number
  ): Promise<Expense | null> {
    const result = await pool.query<Expense>(
      `
      SELECT
        id,
        amount,
        description,
        date,
        category_id,
        created_at,
        updated_at
      FROM expenses
      WHERE id = $1
        AND user_id = $2
      `,
      [id, userId]
    );

    return result.rows[0] ?? null;
  }


  /**
   * Obtiene el saldo disponible del usuario.
   *
   * Saldo disponible =
   * Total de ingresos - Total de gastos
   */
  async getAvailableBalance(
    userId: number
  ): Promise<number> {

    const result = await pool.query<{ balance: string }>(
      `
      SELECT
        COALESCE(
          (
            SELECT SUM(amount)
            FROM incomes
            WHERE user_id = $1
          ),
          0
        )
        -
        COALESCE(
          (
            SELECT SUM(amount)
            FROM expenses
            WHERE user_id = $1
          ),
          0
        ) AS balance
      `,
      [userId]
    );

    return Number(
      result.rows[0]?.balance ?? 0
    );
  }


  /**
   * Obtiene el saldo disponible considerando
   * que un gasto existente será reemplazado.
   *
   * Esto es necesario al editar un gasto.
   */
  async getAvailableBalanceForUpdate(
    expenseId: string,
    userId: number
  ): Promise<number> {

    const result = await pool.query<{ balance: string }>(
      `
      SELECT
        COALESCE(
          (
            SELECT SUM(amount)
            FROM incomes
            WHERE user_id = $1
          ),
          0
        )
        -
        COALESCE(
          (
            SELECT SUM(amount)
            FROM expenses
            WHERE user_id = $1
              AND id <> $2
          ),
          0
        ) AS balance
      `,
      [userId, expenseId]
    );

    return Number(
      result.rows[0]?.balance ?? 0
    );
  }


  async create(
    data: CreateExpenseData
  ): Promise<Expense> {

    const result = await pool.query<Expense>(
      `
      INSERT INTO expenses (
        amount,
        description,
        date,
        category_id,
        user_id
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        amount,
        description,
        date,
        category_id,
        created_at,
        updated_at
      `,
      [
        data.amount,
        data.description ?? null,
        data.date,
        data.category_id,
        data.user_id
      ]
    );

    return result.rows[0];
  }


  async update(
    id: string,
    userId: number,
    data: UpdateExpenseData
  ): Promise<Expense | null> {

    const result = await pool.query<Expense>(
      `
      UPDATE expenses
      SET
        amount = $1,
        description = $2,
        date = $3,
        category_id = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
        AND user_id = $6
      RETURNING
        id,
        amount,
        description,
        date,
        category_id,
        created_at,
        updated_at
      `,
      [
        data.amount,
        data.description ?? null,
        data.date,
        data.category_id,
        id,
        userId
      ]
    );

    return result.rows[0] ?? null;
  }


  async delete(
    id: string,
    userId: number
  ): Promise<boolean> {

    const result = await pool.query(
      `
      DELETE FROM expenses
      WHERE id = $1
        AND user_id = $2
      `,
      [id, userId]
    );

    return result.rowCount === 1;
  }

}