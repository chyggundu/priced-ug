import { Router } from "express";
import { clerkClient } from "@clerk/express";
import { db } from "@workspace/db";
import { reviewsTable, businessesTable } from "@workspace/db";
import { eq, and, desc, isNull } from "drizzle-orm";
import { requireAuth, requireAdmin, optionalAuth } from "../lib/auth";

const router = Router();

async function resolveDisplayName(userId: string): Promise<string> {
  try {
    const user = await clerkClient.users.getUser(userId);
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    // Never fall back to email — this name is shown on a public endpoint.
    return fullName || user.username || "Anonymous";
  } catch {
    return "Anonymous";
  }
}

router.get("/businesses/:businessId/reviews", optionalAuth, async (req, res) => {
  try {
    const businessId = parseInt(req.params.businessId);
    if (Number.isNaN(businessId)) {
      res.status(400).json({ error: "Invalid business id" });
      return;
    }
    const currentUserId = req.userId;
    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.businessId, businessId))
      .orderBy(desc(reviewsTable.createdAt));

    // Never expose raw Clerk user ids publicly; surface only an "isMine" flag.
    const sanitized = reviews.map(({ userId, ...rest }) => ({
      ...rest,
      isMine: !!currentUserId && userId === currentUserId,
    }));
    res.json(sanitized);
  } catch (err) {
    req.log.error({ err }, "Failed to get reviews");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/businesses/:businessId/reviews", requireAuth, async (req, res) => {
  try {
    const businessId = parseInt(req.params.businessId);
    if (Number.isNaN(businessId)) {
      res.status(400).json({ error: "Invalid business id" });
      return;
    }
    const userId = req.userId!;
    const { rating, comment } = req.body ?? {};

    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
      return;
    }
    if (comment != null && typeof comment !== "string") {
      res.status(400).json({ error: "Comment must be a string" });
      return;
    }

    const [business] = await db
      .select({ id: businessesTable.id, clerkUserId: businessesTable.clerkUserId })
      .from(businessesTable)
      .where(eq(businessesTable.id, businessId));

    if (!business) {
      res.status(404).json({ error: "Business not found" });
      return;
    }
    if (business.clerkUserId === userId) {
      res.status(403).json({ error: "You cannot review your own business" });
      return;
    }

    const [existing] = await db
      .select({ id: reviewsTable.id })
      .from(reviewsTable)
      .where(and(eq(reviewsTable.businessId, businessId), eq(reviewsTable.userId, userId)));

    if (existing) {
      res.status(409).json({ error: "You have already reviewed this business" });
      return;
    }

    const authorName = await resolveDisplayName(userId);

    let review;
    try {
      [review] = await db
        .insert(reviewsTable)
        .values({
          businessId,
          userId,
          authorName,
          rating,
          comment: typeof comment === "string" ? comment.trim() || null : null,
        })
        .returning();
    } catch (insertErr) {
      // Unique (business_id, user_id) violation — race with another concurrent request.
      if ((insertErr as { code?: string })?.code === "23505") {
        res.status(409).json({ error: "You have already reviewed this business" });
        return;
      }
      throw insertErr;
    }

    const { userId: _omit, ...rest } = review;
    res.status(201).json({ ...rest, isMine: true });
  } catch (err) {
    req.log.error({ err }, "Failed to create review");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reviews/:reviewId/reply", requireAuth, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    if (Number.isNaN(reviewId)) {
      res.status(400).json({ error: "Invalid review id" });
      return;
    }
    const userId = req.userId!;
    const { reply } = req.body ?? {};
    if (!reply || typeof reply !== "string" || !reply.trim()) {
      res.status(400).json({ error: "Reply text is required" });
      return;
    }

    const [review] = await db
      .select({ id: reviewsTable.id, businessId: reviewsTable.businessId, reply: reviewsTable.reply })
      .from(reviewsTable)
      .where(eq(reviewsTable.id, reviewId));

    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    const [business] = await db
      .select({ clerkUserId: businessesTable.clerkUserId })
      .from(businessesTable)
      .where(eq(businessesTable.id, review.businessId));

    if (!business || business.clerkUserId !== userId) {
      res.status(403).json({ error: "Only the business owner can reply" });
      return;
    }

    // Atomic one-reply guard: only update when no reply exists yet, so two
    // concurrent requests cannot both succeed.
    const [updated] = await db
      .update(reviewsTable)
      .set({ reply: reply.trim(), repliedAt: new Date() })
      .where(and(eq(reviewsTable.id, reviewId), isNull(reviewsTable.reply)))
      .returning();

    if (!updated) {
      res.status(409).json({ error: "You have already replied to this review" });
      return;
    }

    const { userId: _omit, ...rest } = updated;
    res.json({ ...rest, isMine: !!req.userId && _omit === req.userId });
  } catch (err) {
    req.log.error({ err }, "Failed to reply to review");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/reviews/:reviewId", requireAdmin, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    if (Number.isNaN(reviewId)) {
      res.status(400).json({ error: "Invalid review id" });
      return;
    }
    await db.delete(reviewsTable).where(eq(reviewsTable.id, reviewId));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete review");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
