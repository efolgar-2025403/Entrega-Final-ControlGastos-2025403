import { pool } from '../../../config/database.js';
import { User } from '../models/user.model.js';

export class AuthRepository {

  private readonly selectColumns = `
    id,
    name,
    email,
    password_hash,
    google_sub,
    google_picture,
    created_at,
    updated_at
  `;

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>(
      `
      SELECT
        ${this.selectColumns}
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [email]
    );

    return result.rows[0] ?? null;
  }

  async findByGoogleSub(googleSub: string): Promise<User | null> {
    const result = await pool.query<User>(
      `
      SELECT
        ${this.selectColumns}
      FROM users
      WHERE google_sub = $1
      LIMIT 1
      `,
      [googleSub]
    );

    return result.rows[0] ?? null;
  }

  async create(
    name: string,
    email: string,
    passwordHash: string
  ): Promise<User> {

    const result = await pool.query<User>(
      `
      INSERT INTO users (
        name,
        email,
        password_hash
      )
      VALUES ($1, $2, $3)
      RETURNING
        ${this.selectColumns}
      `,
      [name, email, passwordHash]
    );

    return result.rows[0];
  }

  async createGoogleUser(
    name: string,
    email: string,
    googleSub: string,
    googlePicture: string | null
  ): Promise<User> {

    const result = await pool.query<User>(
      `
      INSERT INTO users (
        name,
        email,
        password_hash,
        google_sub,
        google_picture
      )
      VALUES ($1, $2, NULL, $3, $4)
      RETURNING
        ${this.selectColumns}
      `,
      [name, email, googleSub, googlePicture]
    );

    return result.rows[0];
  }

  async linkGoogleAccount(
    userId: number,
    googleSub: string,
    googlePicture: string | null
  ): Promise<User> {

    const result = await pool.query<User>(
      `
      UPDATE users
      SET
        google_sub = $2,
        google_picture = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING
        ${this.selectColumns}
      `,
      [userId, googleSub, googlePicture]
    );

    return result.rows[0];
  }
}