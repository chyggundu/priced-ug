import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
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
import { businessesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_ID = "user_admin";
const OWNER_ID = "user_owner";
const OTHER_ID = "user_other";

function signIn(userId: string | null) {
  authState.userId = userId;
}

async function seedBusiness(clerkUserId: string, name = "Test Shop") {
  const [row] = await testDb
    .insert(businessesTable)
    .values({ clerkUserId, name })
    .returning();
  return row;
}

const validBusiness = {
  name: "Kampala Crafts",
  description: "Handmade goods",
  address: "Plot 1",
  city: "Kampala",
  phone: "0700000000",
};

const originalAdminId = process.env.ADMIN_USER_ID;

beforeAll(async () => {
  await setupSchema();
  process.env.ADMIN_USER_ID = ADMIN_ID;
});

afterAll(() => {
  if (originalAdminId === undefined) {
    delete process.env.ADMIN_USER_ID;
  } else {
    process.env.ADMIN_USER_ID = originalAdminId;
  }
});

beforeEach(async () => {
  await resetDb();
  signIn(null);
});

describe("creating a business requires sign-in", () => {
  it("rejects POST /api/businesses when signed out with 401", async () => {
    const res = await request(app).post("/api/businesses").send(validBusiness);
    expect(res.status).toBe(401);
  });

  it("creates a business for a signed-in user", async () => {
    signIn(OWNER_ID);
    const res = await request(app).post("/api/businesses").send(validBusiness);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Kampala Crafts");
  });

  it("rejects a business with no name with 400", async () => {
    signIn(OWNER_ID);
    const res = await request(app)
      .post("/api/businesses")
      .send({ description: "no name" });
    expect(res.status).toBe(400);
  });
});

describe("a user can own at most one business", () => {
  it("rejects a second business for the same user with 400", async () => {
    signIn(OWNER_ID);
    const first = await request(app).post("/api/businesses").send(validBusiness);
    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/api/businesses")
      .send({ ...validBusiness, name: "Second Shop" });
    expect(second.status).toBe(400);

    const rows = await testDb.select().from(businessesTable);
    expect(rows.length).toBe(1);
  });
});

describe("editing a business requires sign-in and ownership", () => {
  it("rejects PATCH /api/businesses/me when signed out with 401", async () => {
    const res = await request(app)
      .patch("/api/businesses/me")
      .send({ name: "New name" });
    expect(res.status).toBe(401);
  });

  it("returns 404 when a signed-in user owns no business", async () => {
    signIn(OTHER_ID);
    const res = await request(app)
      .patch("/api/businesses/me")
      .send({ name: "New name" });
    expect(res.status).toBe(404);
  });

  it("lets the owner update only their own business", async () => {
    await seedBusiness(OWNER_ID, "Old name");
    await seedBusiness(OTHER_ID, "Other shop");
    signIn(OWNER_ID);

    const res = await request(app)
      .patch("/api/businesses/me")
      .send({ name: "Updated name" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated name");

    const [other] = await testDb
      .select()
      .from(businessesTable)
      .where(eq(businessesTable.clerkUserId, OTHER_ID));
    expect(other.name).toBe("Other shop");
  });

  it("blocks edits while the page is hidden by the admin", async () => {
    const biz = await seedBusiness(OWNER_ID);
    await testDb
      .update(businessesTable)
      .set({ isHidden: true })
      .where(eq(businessesTable.id, biz.id));
    signIn(OWNER_ID);

    const res = await request(app)
      .patch("/api/businesses/me")
      .send({ name: "Sneaky update" });
    expect(res.status).toBe(403);
  });
});

describe("only admins can hide or show a business", () => {
  it("rejects an anonymous request with 401", async () => {
    const biz = await seedBusiness(OWNER_ID);
    const res = await request(app)
      .patch(`/api/businesses/${biz.id}/visibility`)
      .send({ isHidden: true });
    expect(res.status).toBe(401);
  });

  it("rejects the owner toggling their own visibility with 403", async () => {
    const biz = await seedBusiness(OWNER_ID);
    signIn(OWNER_ID);
    const res = await request(app)
      .patch(`/api/businesses/${biz.id}/visibility`)
      .send({ isHidden: true });
    expect(res.status).toBe(403);
  });

  it("rejects a non-admin signed-in user with 403", async () => {
    const biz = await seedBusiness(OWNER_ID);
    signIn(OTHER_ID);
    const res = await request(app)
      .patch(`/api/businesses/${biz.id}/visibility`)
      .send({ isHidden: true });
    expect(res.status).toBe(403);
  });

  it("allows the admin to hide a business", async () => {
    const biz = await seedBusiness(OWNER_ID);
    signIn(ADMIN_ID);
    const res = await request(app)
      .patch(`/api/businesses/${biz.id}/visibility`)
      .send({ isHidden: true });
    expect(res.status).toBe(200);
    expect(res.body.isHidden).toBe(true);

    const [row] = await testDb
      .select()
      .from(businessesTable)
      .where(eq(businessesTable.id, biz.id));
    expect(row.isHidden).toBe(true);
  });

  it("allows the admin to show a hidden business again", async () => {
    const biz = await seedBusiness(OWNER_ID);
    await testDb
      .update(businessesTable)
      .set({ isHidden: true })
      .where(eq(businessesTable.id, biz.id));
    signIn(ADMIN_ID);
    const res = await request(app)
      .patch(`/api/businesses/${biz.id}/visibility`)
      .send({ isHidden: false });
    expect(res.status).toBe(200);
    expect(res.body.isHidden).toBe(false);
  });
});
