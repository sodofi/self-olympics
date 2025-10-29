import { Pool } from 'pg';

/**
 * PostgreSQL Connection Pool
 * 
 * What this does:
 * - Creates a pool of database connections that can be reused
 * - Instead of opening/closing connections each time, we reuse them (faster!)
 * - Handles multiple requests at the same time
 */

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    // Check if database URL is set
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }

    // Create connection pool
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    console.log('✅ PostgreSQL connected');
  }

  return pool;
}

/**
 * Helper function to run SQL queries
 * 
 * Example usage:
 * const result = await query('SELECT * FROM countries');
 * console.log(result.rows);
 */
export async function query(text: string, params?: any[]) {
  const pool = getPool();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get a client for transactions (when you need multiple queries to succeed together)
 */
export async function getClient() {
  const pool = getPool();
  return await pool.connect();
}

