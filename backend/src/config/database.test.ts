import { pool } from './database.js';

async function testDatabaseConnection(): Promise<void> {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');

    console.log('Database connection successful.');
    console.log('Database time:', result.rows[0].current_time);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();