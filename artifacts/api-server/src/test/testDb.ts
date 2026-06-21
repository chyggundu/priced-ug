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

    CREATE TABLE IF NOT EXISTS categories (
      id serial PRIMARY KEY,
      name text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS products (
      id serial PRIMARY KEY,
      business_id integer NOT NULL,
      category_id integer,
      name text NOT NULL,
      description text,
      price text,
      image_url text,
      size text,
      materials text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id serial PRIMARY KEY,
      business_id integer NOT NULL,
      user_id text NOT NULL,
      author_name text NOT NULL,
      rating integer NOT NULL,
      comment text,
      reply text,
      replied_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT reviews_business_user_unique UNIQUE (business_id, user_id)
    );
  `);
}

export async function resetDb() {
  await client.exec(
    `TRUNCATE reviews, products, categories, customers, businesses RESTART IDENTITY CASCADE;`,
  );
}
