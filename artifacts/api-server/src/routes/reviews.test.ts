import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const authState = vi.hoisted(() => ({ userId: null as string | null }));

vi.mock("@clerk/express", () => ({
  clerkMiddleware:
    () =>
    (_req: unknown, _res: unknown, next: () => void) =>
      next(),
  getAuth: () => ({ userId: authState.userId }),
  clerkClient: {
    users: {
      getUser: async (userId: string) => ({
        firstName: "Test",
        lastName: userId,
        username: null,
      }),
    },
  },
}));

vi.mock("@workspace/db", async () => {
  const schema = await import("@workspace/db/schema");
  const { testDb } = await import("../test/testDb");
  return { db: testDb, ...schema };
});

import app from "../app";
import { testDb, setupSchema, resetDb } from "../test/testDb";
import { businessesTable, reviewsTable } from "@workspace/db/schema";

const ADMIN_ID = "user_admin";
const OWNER_ID = "user_owner";
const REVIEWER_ID = "user_reviewer";
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

async function seedReview(
  businessId: number,
  userId: string,
  overrides: Partial<{ rating: number; comment: string | null; reply: string | null }> = {},
) {
  const [row] = await testDb
    .insert(reviewsTable)
    .values({
      businessId,
      userId,
      authorName: "Seeded Reviewer",
      rating: overrides.rating ?? 4,
      comment: overrides.comment ?? "Nice",
      reply: overrides.reply ?? null,
    })
    .returning();
  return row;
}

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

describe("leaving a review requires sign-in", () => {
  it("rejects an anonymous review with 401", async () => {
    const biz = await seedBusiness(OWNER_ID);
    const res = await request(app)
      .post(`/api/businesses/${biz.id}/reviews`)
      .send({ rating: 5, comment: "Great" });
    expect(res.status).toBe(401);
  });

  it("creates a review for a signed-in shopper", async () => {
    const biz = await seedBusiness(OWNER_ID);
    signIn(REVIEWER_ID);
    const res = await request(app)
      .post(`/api/businesses/${biz.id}/reviews`)
      .send({ rating: 5, comment: "Great" });
    expect(res.status).toBe(201);
    expect(res.body.rating).toBe(5);
  });

  it("rejects an invalid rating with 400", async () => {
    const biz = await seedBusiness(OWNER_ID);
    signIn(REVIEWER_ID);
    const res = await request(app)
      .post(`/api/businesses/${biz.id}/reviews`)
      .send({ rating: 9 });
    expect(res.status).toBe(400);
  });
});

describe("a business owner cannot review their own business", () => {
  it("rejects the owner with 403", async () => {
    const biz = await seedBusiness(OWNER_ID);
    signIn(OWNER_ID);
    const res = await request(app)
      .post(`/api/businesses/${biz.id}/reviews`)
      .send({ rating: 5 });
    expect(res.status).toBe(403);
  });
});

describe("reviews enforce one review per user", () => {
  it("rejects a second review from the same user with 409", async () => {
    const biz = await seedBusiness(OWNER_ID);
    signIn(REVIEWER_ID);

    const first = await request(app)
      .post(`/api/businesses/${biz.id}/reviews`)
      .send({ rating: 4, comment: "Good" });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post(`/api/businesses/${biz.id}/reviews`)
      .send({ rating: 2, comment: "Changed my mind" });
    expect(second.status).toBe(409);

    const rows = await testDb.select().from(reviewsTable);
    expect(rows.length).toBe(1);
  });
});

describe("only the business owner can reply to a review", () => {
  it("rejects an anonymous reply with 401", async () => {
    const biz = await seedBusiness(OWNER_ID);
    const review = await seedReview(biz.id, REVIEWER_ID);
    const res = await request(app)
      .post(`/api/reviews/${review.id}/reply`)
      .send({ reply: "Thanks" });
    expect(res.status).toBe(401);
  });

  it("rejects a non-owner reply with 403", async () => {
    const biz = await seedBusiness(OWNER_ID);
    const review = await seedReview(biz.id, REVIEWER_ID);
    signIn(OTHER_ID);
    const res = await request(app)
      .post(`/api/reviews/${review.id}/reply`)
      .send({ reply: "Thanks" });
    expect(res.status).toBe(403);
  });

  it("allows the owner to reply once", async () => {
    const biz = await seedBusiness(OWNER_ID);
    const review = await seedReview(biz.id, REVIEWER_ID);
    signIn(OWNER_ID);
    const res = await request(app)
      .post(`/api/reviews/${review.id}/reply`)
      .send({ reply: "Thank you!" });
    expect(res.status).toBe(200);
    expect(res.body.reply).toBe("Thank you!");
  });

  it("rejects a second reply from the owner with 409", async () => {
    const biz = await seedBusiness(OWNER_ID);
    const review = await seedReview(biz.id, REVIEWER_ID, { reply: "Already replied" });
    signIn(OWNER_ID);
    const res = await request(app)
      .post(`/api/reviews/${review.id}/reply`)
      .send({ reply: "Second reply" });
    expect(res.status).toBe(409);
  });
});

describe("only admins can delete a review", () => {
  it("rejects an anonymous delete with 401", async () => {
    const biz = await seedBusiness(OWNER_ID);
    const review = await seedReview(biz.id, REVIEWER_ID);
    const res = await request(app).delete(`/api/reviews/${review.id}`);
    expect(res.status).toBe(401);
  });

  it("rejects the business owner deleting a review with 403", async () => {
    const biz = await seedBusiness(OWNER_ID);
    const review = await seedReview(biz.id, REVIEWER_ID);
    signIn(OWNER_ID);
    const res = await request(app).delete(`/api/reviews/${review.id}`);
    expect(res.status).toBe(403);
  });

  it("allows the admin to delete any review", async () => {
    const biz = await seedBusiness(OWNER_ID);
    const review = await seedReview(biz.id, REVIEWER_ID);
    signIn(ADMIN_ID);
    const res = await request(app).delete(`/api/reviews/${review.id}`);
    expect(res.status).toBe(200);

    const rows = await testDb.select().from(reviewsTable);
    expect(rows.length).toBe(0);
  });
});

describe("review responses never expose the internal Clerk user ID", () => {
  it("omits userId from the public reviews list and uses isMine", async () => {
    const biz = await seedBusiness(OWNER_ID);
    await seedReview(biz.id, REVIEWER_ID);
    signIn(REVIEWER_ID);
    const res = await request(app).get(`/api/businesses/${biz.id}/reviews`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).not.toHaveProperty("userId");
    expect(res.body[0]).not.toHaveProperty("user_id");
    expect(res.body[0].isMine).toBe(true);
  });

  it("reports isMine=false for another user's review", async () => {
    const biz = await seedBusiness(OWNER_ID);
    await seedReview(biz.id, REVIEWER_ID);
    signIn(OTHER_ID);
    const res = await request(app).get(`/api/businesses/${biz.id}/reviews`);
    expect(res.status).toBe(200);
    expect(res.body[0]).not.toHaveProperty("userId");
    expect(res.body[0].isMine).toBe(false);
  });

  it("omits userId from the create-review response", async () => {
    const biz = await seedBusiness(OWNER_ID);
    signIn(REVIEWER_ID);
    const res = await request(app)
      .post(`/api/businesses/${biz.id}/reviews`)
      .send({ rating: 5, comment: "Great" });
    expect(res.status).toBe(201);
    expect(res.body).not.toHaveProperty("userId");
    expect(res.body).not.toHaveProperty("user_id");
    expect(res.body.isMine).toBe(true);
  });

  it("omits userId from the reply response", async () => {
    const biz = await seedBusiness(OWNER_ID);
    const review = await seedReview(biz.id, REVIEWER_ID);
    signIn(OWNER_ID);
    const res = await request(app)
      .post(`/api/reviews/${review.id}/reply`)
      .send({ reply: "Thanks!" });
    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty("userId");
    expect(res.body).not.toHaveProperty("user_id");
  });
});
