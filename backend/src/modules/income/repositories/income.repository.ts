import { pool } from '../../../config/database.js';

import { Income } from '../models/income.model.js';


export interface CreateIncomeData {

  amount: number;

  description?: string | null;

  date: string;

  category_id: string;

  user_id: number;

}


export interface UpdateIncomeData {

  amount: number;

  description?: string | null;

  date: string;

  category_id: string;

}


export class IncomeRepository {

  async findAll(
    userId: number
  ): Promise<Income[]> {

    const result = await pool.query<Income>(
      `
      SELECT
        id,
        amount,
        description,
        date,
        category_id,
        created_at,
        updated_at
      FROM incomes
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
  ): Promise<Income | null> {

    const result = await pool.query<Income>(
      `
      SELECT
        id,
        amount,
        description,
        date,
        category_id,
        created_at,
        updated_at
      FROM incomes
      WHERE id = $1
        AND user_id = $2
      `,
      [id, userId]
    );

    return result.rows[0] ?? null;
  }


  async create(
    data: CreateIncomeData
  ): Promise<Income> {

    const result = await pool.query<Income>(
      `
      INSERT INTO incomes (
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
    data: UpdateIncomeData
  ): Promise<Income | null> {

    const result = await pool.query<Income>(
      `
      UPDATE incomes
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
      DELETE FROM incomes
      WHERE id = $1
        AND user_id = $2
      `,
      [id, userId]
    );

    return result.rowCount === 1;
  }

}