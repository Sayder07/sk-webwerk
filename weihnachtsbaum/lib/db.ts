import 'server-only';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Datenbankzugriff.
 *  - Produktion: Postgres über DATABASE_URL (Supabase, Neon, Vercel Postgres …)
 *  - Lokal ohne DATABASE_URL: eingebettetes Postgres (PGlite) im Ordner .data/ – nichts zu installieren.
 * Beide sprechen dasselbe SQL; die Tabellen werden beim ersten Zugriff automatisch angelegt.
 */

export type Query = (text: string, params?: unknown[]) => Promise<Record<string, any>[]>;

export interface Db {
  query: Query;
  tx<T>(fn: (query: Query) => Promise<T>): Promise<T>;
}

const SCHEMA = `
create table if not exists orders (
  id uuid primary key,
  order_number text not null unique,
  created_at timestamptz not null default now(),
  status text not null default 'pending',
  delivery_date text not null,
  zone integer not null,
  slot_id text not null,
  tree_id text not null,
  shape_id text not null,
  extras jsonb not null default '[]',
  line_items jsonb not null default '[]',
  total_cents integer not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  street text not null,
  plz text not null,
  city text not null,
  notes text not null default '',
  payment_mode text not null default 'stripe',
  stripe_session_id text,
  paid_at timestamptz
);
create index if not exists orders_delivery_idx on orders (delivery_date, zone, slot_id);
create table if not exists inquiries (
  id uuid primary key,
  created_at timestamptz not null default now(),
  kind text not null,
  status text not null default 'neu',
  name text not null,
  email text not null,
  phone text not null default '',
  plz text not null default '',
  message text not null default '',
  payload jsonb not null default '{}'
);
`;

async function createDb(): Promise<Db> {
  const url = process.env.DATABASE_URL;

  if (url) {
    const { default: postgres } = await import('postgres');
    // prepare:false, damit auch Supabase-/Neon-Pooler (Transaction Mode) funktionieren
    const sql = postgres(url, { prepare: false, max: 3, idle_timeout: 20, onnotice: () => {} });
    const db: Db = {
      query: async (text, params = []) => (await sql.unsafe(text, params as any[])) as unknown as Record<string, any>[],
      tx: (fn) =>
        sql.begin((tx) => fn(async (text, params = []) => (await tx.unsafe(text, params as any[])) as unknown as Record<string, any>[])) as Promise<any>,
    };
    await sql.unsafe(SCHEMA);
    return db;
  }

  if (process.env.VERCEL || process.env.NETLIFY) {
    throw new Error('DATABASE_URL fehlt. Auf dem Server wird eine Postgres-Datenbank benötigt (siehe README, Abschnitt „Datenbank“).');
  }

  const { PGlite } = await import('@electric-sql/pglite');
  const dir = path.join(process.cwd(), '.data', 'pglite');
  fs.mkdirSync(dir, { recursive: true });
  const pg = new PGlite(dir);
  await pg.exec(SCHEMA);
  return {
    query: async (text, params = []) => (await pg.query(text, params as any[])).rows as Record<string, any>[],
    tx: (fn) => pg.transaction((tx) => fn(async (text, params = []) => (await tx.query(text, params as any[])).rows as Record<string, any>[])) as Promise<any>,
  };
}

const globalRef = globalThis as unknown as { __wbDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  if (!globalRef.__wbDb) {
    globalRef.__wbDb = createDb().catch((err) => {
      globalRef.__wbDb = undefined;
      throw err;
    });
  }
  return globalRef.__wbDb;
}
