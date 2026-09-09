import fs from 'node:fs/promises';
import path from 'node:path';
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';

export type ConsumptionType = 'beer' | 'cigarette';

export interface Consumption {
  id: number;
  clientId: string;
  type: ConsumptionType;
  quantity: number;
  occurredAt: string;
  createdAt: string;
}

export interface ConsumptionInput {
  clientId: string;
  type: ConsumptionType;
  quantity: number;
  occurredAt: string;
}

let database: Promise<Database> | undefined;

export function getDatabase(): Promise<Database> {
  database ??= (async () => {
    const filename = path.resolve(process.env.DATABASE_PATH ?? './data/habit-pop.sqlite');
    await fs.mkdir(path.dirname(filename), { recursive: true });
    const db = await open({ filename, driver: sqlite3.Database });
    await db.exec(`
      CREATE TABLE IF NOT EXISTS consumptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK (type IN ('beer', 'cigarette')),
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        occurred_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_consumptions_occurred_at
        ON consumptions (occurred_at);
    `);
    return db;
  })();

  return database;
}

export async function insertConsumption(input: ConsumptionInput): Promise<Consumption> {
  const db = await getDatabase();
  await db.run(
    `INSERT OR IGNORE INTO consumptions
      (client_id, type, quantity, occurred_at)
      VALUES (?, ?, ?, ?)`,
    input.clientId,
    input.type,
    input.quantity,
    input.occurredAt,
  );

  const consumption = await db.get<Consumption>(
    `SELECT id, client_id AS clientId, type, quantity,
      occurred_at AS occurredAt, created_at AS createdAt
      FROM consumptions WHERE client_id = ?`,
    input.clientId,
  );

  if (!consumption) {
    throw new Error('Consumption could not be stored');
  }

  return consumption;
}

export async function insertConsumptions(inputs: ConsumptionInput[]): Promise<Consumption[]> {
  const db = await getDatabase();
  await db.run('BEGIN');

  try {
    for (const input of inputs) {
      await db.run(
        `INSERT OR IGNORE INTO consumptions
          (client_id, type, quantity, occurred_at)
          VALUES (?, ?, ?, ?)`,
        input.clientId,
        input.type,
        input.quantity,
        input.occurredAt,
      );
    }

    const stored = await Promise.all(inputs.map((input) => getConsumptionByClientId(input.clientId)));
    if (stored.some((consumption) => !consumption)) {
      throw new Error('Consumption could not be stored');
    }

    await db.run('COMMIT');
    return stored as Consumption[];
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
}

export async function getConsumptionByClientId(clientId: string): Promise<Consumption | undefined> {
  const db = await getDatabase();
  return db.get<Consumption>(
    `SELECT id, client_id AS clientId, type, quantity,
      occurred_at AS occurredAt, created_at AS createdAt
      FROM consumptions WHERE client_id = ?`,
    clientId,
  );
}
export async function listConsumptions(from?: string, to?: string): Promise<Consumption[]> {
  const db = await getDatabase();
  const conditions: string[] = [];
  const parameters: string[] = [];

  if (from) {
    conditions.push('occurred_at >= ?');
    parameters.push(from);
  }

  if (to) {
    conditions.push('occurred_at <= ?');
    parameters.push(to);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return db.all<Consumption[]>(
    `SELECT id, client_id AS clientId, type, quantity,
      occurred_at AS occurredAt, created_at AS createdAt
      FROM consumptions ${where} ORDER BY occurred_at DESC`,
    ...parameters,
  );
}