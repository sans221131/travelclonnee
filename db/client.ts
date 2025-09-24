import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

declare global {
  // eslint-disable-next-line no-var
  var __drizzleDb__: ReturnType<typeof drizzle> | undefined;
}

const connectionString = process.env.NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'NEON_DATABASE_URL is not configured. Set it in your environment before importing db.'
  );
}

const neonClient = neon(connectionString);

export const db: ReturnType<typeof drizzle> =
  globalThis.__drizzleDb__ ?? drizzle(neonClient, { schema });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__drizzleDb__ = db;
}

export type DbInstance = typeof db;