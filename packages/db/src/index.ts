import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema/index';

export * from './schema/index';
export { eq, desc, and, or, sql, like, ilike, lt, lte, gt, gte, inArray } from 'drizzle-orm';

declare const process: any;

export function createDb(connectionString?: string) {
  const connStr = connectionString || process.env.DATABASE_URL || '';
  if (!connStr) {
    // Return mock-friendly or placeholder when connection string is not set
    console.warn('DATABASE_URL not configured. Operating in disconnected/mock mode.');
  }
  const sql = neon(connStr);
  return drizzle(sql, { schema });
}

export type DbClient = ReturnType<typeof createDb>;
