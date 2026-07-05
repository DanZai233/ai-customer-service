import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as authSchema from "@/db/auth-schema";
import * as appSchema from "@/db/schema";

const schema = { ...appSchema, ...authSchema };

type Database = ReturnType<typeof drizzle<typeof schema>>;

let database: Database | null = null;
let sqlClient: ReturnType<typeof postgres> | null = null;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!database || !sqlClient) {
    sqlClient = postgres(databaseUrl, {
      max: Number(process.env.DATABASE_POOL_SIZE ?? 10),
      prepare: false,
    });
    database = drizzle(sqlClient, { schema });
  }

  return database;
}

export async function closeDatabase() {
  await sqlClient?.end();
  sqlClient = null;
  database = null;
}

export async function checkDatabaseConnection() {
  await getDatabase().execute(sql`select 1`);
  return true;
}
