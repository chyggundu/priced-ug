import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "@workspace/db/schema";

const client = new PGlite();
export const testDb = drizzle(client, { schema });

export async function setupSchema() {
  await client.exec(`
    CREATE TABLE IF NOT EXISTS businesses (
      id serial PRIMARY KEY,
      clerk_user_id text NOT NULL UNIQUE,
      name text NOT NULL,
      description text,
      address text,
      city text,
      phone text,
      category_id integer,
      image_url text,
      latitude double precision,
      longitude double precision,
      is_hidden boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS customers (
      id serial PRIMARY KEY,
      clerk_user_id text NOT NULL UNIQUE,
      full_name text NOT NULL,
      phone text NOT NULL,
      district text NOT NULL,
      town text,
      village text,
      street text,
      latitude double precision,
      longitude double precision,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

export async function resetDb() {
  await client.exec(
    `TRUNCATE customers, businesses RESTART IDENTITY CASCADE;`,
  );
}
