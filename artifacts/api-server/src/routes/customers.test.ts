import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const authState = vi.hoisted(() => ({ userId: null as string | null }));

vi.mock("@clerk/express", () => ({
  clerkMiddleware:
    () =>
    (_req: unknown, _res: unknown, next: () => void) =>
      next(),
  getAuth: () => ({ userId: authState.userId }),
}));

vi.mock("@workspace/db", async () => {
  const schema = await import("@workspace/db/schema");
  const { testDb } = await import("../test/testDb");
  return { db: testDb, ...schema };
});

import app from "../app";
import { testDb, setupSchema, resetDb } from "../test/testDb";
import { businessesTable, customersTable } from "@workspace/db/schema";

const ADMIN_ID = "user_admin";
const OWNER_ID = "user_owner";
const SHOPPER_ID = "user_shopper";

function signIn(userId: string | null) {
  authState.userId = userId;
}

async function seedBusinessOwner(clerkUserId: string) {
  await testDb
    .insert(businessesTable)
    .values({ clerkUserId, name: "Test Shop" });
}

async function seedCustomer(
  overrides: Partial<{
    clerkUserId: string;
    fullName: string;
    phone: string;
    district: string;
  }> = {},
) {
  await testDb.insert(customersTable).values({
    clerkUserId: overrides.clerkUserId ?? "user_existing",
    fullName: overrides.fullName ?? "Jane Doe",
    phone: overrides.phone ?? "0700000000",
    district: overrides.district ?? "Kampala",
  });
}

const validProfile = {
  fullName: "Jane Doe",
  phone: "0700000000",
  district: "Kampala",
  town: "Central",
};

beforeAll(async () => {
  await setupSchema();
});

beforeEach(async () => {
  await resetDb();
  signIn(null);
});

describe("authentication is required for every customer endpoint", () => {
  it("GET /api/customers/me returns 401 when signed out", async () => {
    const res = await request(app).get("/api/customers/me");
    expect(res.status).toBe(401);
  });

  it("PUT /api/customers/me returns 401 when signed out", async () => {
    const res = await request(app).put("/api/customers/me").send(validProfile);
    expect(res.status).toBe(401);
  });

  it("POST /api/customers/lookup returns 401 when signed out", async () => {
    const res = await request(app)
      .post("/api/customers/lookup")
      .send({ phone: "0700000000", district: "Kampala" });
    expect(res.status).toBe(401);
  });

  it("GET /api/admin/customers returns 401 when signed out", async () => {
    const res = await request(app).get("/api/admin/customers");
    expect(res.status).toBe(401);
  });
});

describe("customer lookup is restricted to business owners and admins", () => {
  beforeEach(async () => {
    await seedCustomer({ phone: "0700000000", district: "Kampala" });
  });

  it("rejects a signed-in shopper who owns no business with 403", async () => {
    signIn(SHOPPER_ID);
    const res = await request(app)
      .post("/api/customers/lookup")
      .send({ phone: "0700000000", district: "Kampala" });
    expect(res.status).toBe(403);
  });

  it("allows a business owner to look up a customer", async () => {
    await seedBusinessOwner(OWNER_ID);
    signIn(OWNER_ID);
    const res = await request(app)
      .post("/api/customers/lookup")
      .send({ phone: "0700000000", district: "Kampala" });
    expect(res.status).toBe(200);
    expect(res.body.phone).toBe("0700000000");
  });

  it("allows an admin to look up a customer without owning a business", async () => {
    signIn(ADMIN_ID);
    const res = await request(app)
      .post("/api/customers/lookup")
      .send({ phone: "0700000000", district: "Kampala" });
    expect(res.status).toBe(200);
    expect(res.body.phone).toBe("0700000000");
  });

  it("returns 404 when no customer matches", async () => {
    await seedBusinessOwner(OWNER_ID);
    signIn(OWNER_ID);
    const res = await request(app)
      .post("/api/customers/lookup")
      .send({ phone: "0711111111", district: "Gulu" });
    expect(res.status).toBe(404);
  });
});

describe("the full customer list is admin-only", () => {
  beforeEach(async () => {
    await seedCustomer();
  });

  it("rejects a business owner with 403", async () => {
    await seedBusinessOwner(OWNER_ID);
    signIn(OWNER_ID);
    const res = await request(app).get("/api/admin/customers");
    expect(res.status).toBe(403);
  });

  it("rejects a shopper with 403", async () => {
    signIn(SHOPPER_ID);
    const res = await request(app).get("/api/admin/customers");
    expect(res.status).toBe(403);
  });

  it("allows the admin to list all customers", async () => {
    signIn(ADMIN_ID);
    const res = await request(app).get("/api/admin/customers");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });
});

describe("responses never expose the internal Clerk user ID", () => {
  it("omits clerkUserId from GET /api/customers/me", async () => {
    await seedCustomer({ clerkUserId: SHOPPER_ID });
    signIn(SHOPPER_ID);
    const res = await request(app).get("/api/customers/me");
    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty("clerkUserId");
    expect(res.body).not.toHaveProperty("clerk_user_id");
  });

  it("omits clerkUserId from PUT /api/customers/me", async () => {
    signIn(SHOPPER_ID);
    const res = await request(app).put("/api/customers/me").send(validProfile);
    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty("clerkUserId");
    expect(res.body).not.toHaveProperty("clerk_user_id");
  });

  it("omits clerkUserId from the lookup response", async () => {
    await seedCustomer({ phone: "0700000000", district: "Kampala" });
    signIn(ADMIN_ID);
    const res = await request(app)
      .post("/api/customers/lookup")
      .send({ phone: "0700000000", district: "Kampala" });
    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty("clerkUserId");
    expect(res.body).not.toHaveProperty("clerk_user_id");
  });

  it("omits clerkUserId from the admin list response", async () => {
    await seedCustomer({ clerkUserId: SHOPPER_ID });
    signIn(ADMIN_ID);
    const res = await request(app).get("/api/admin/customers");
    expect(res.status).toBe(200);
    expect(res.body[0]).not.toHaveProperty("clerkUserId");
    expect(res.body[0]).not.toHaveProperty("clerk_user_id");
  });
});

describe("saving a profile twice updates the existing row (no duplicates)", () => {
  it("upserts on the second save for the same user", async () => {
    signIn(SHOPPER_ID);

    const first = await request(app)
      .put("/api/customers/me")
      .send(validProfile);
    expect(first.status).toBe(200);

    const second = await request(app)
      .put("/api/customers/me")
      .send({ ...validProfile, fullName: "Jane Updated", town: "Nakawa" });
    expect(second.status).toBe(200);
    expect(second.body.id).toBe(first.body.id);
    expect(second.body.fullName).toBe("Jane Updated");
    expect(second.body.town).toBe("Nakawa");

    const rows = await testDb.select().from(customersTable);
    expect(rows.length).toBe(1);
    expect(rows[0].fullName).toBe("Jane Updated");
  });

  it("validates required fields with a 400", async () => {
    signIn(SHOPPER_ID);
    const res = await request(app)
      .put("/api/customers/me")
      .send({ phone: "0700000000", district: "Kampala" });
    expect(res.status).toBe(400);
  });
});
