import { Router } from "express";
import { db } from "@workspace/db";
import { businessesTable, categoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireAdmin, optionalAuth } from "../lib/auth";

const router = Router();

async function getBusinessWithCategory(businessId: number) {
  const result = await db
    .select({
      id: businessesTable.id,
      clerkUserId: businessesTable.clerkUserId,
      name: businessesTable.name,
      description: businessesTable.description,
      address: businessesTable.address,
      phone: businessesTable.phone,
      categoryId: businessesTable.categoryId,
      categoryName: categoriesTable.name,
      imageUrl: businessesTable.imageUrl,
      isHidden: businessesTable.isHidden,
      createdAt: businessesTable.createdAt,
    })
    .from(businessesTable)
    .leftJoin(categoriesTable, eq(businessesTable.categoryId, categoriesTable.id))
    .where(eq(businessesTable.id, businessId));
  return result[0] ?? null;
}

router.get("/businesses", optionalAuth, async (req, res) => {
  try {
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;

    let query = db
      .select({
        id: businessesTable.id,
        clerkUserId: businessesTable.clerkUserId,
        name: businessesTable.name,
        description: businessesTable.description,
        address: businessesTable.address,
        phone: businessesTable.phone,
        categoryId: businessesTable.categoryId,
        categoryName: categoriesTable.name,
        imageUrl: businessesTable.imageUrl,
        isHidden: businessesTable.isHidden,
        createdAt: businessesTable.createdAt,
      })
      .from(businessesTable)
      .leftJoin(categoriesTable, eq(businessesTable.categoryId, categoriesTable.id));

    const conditions = [eq(businessesTable.isHidden, false)];
    if (categoryId) {
      conditions.push(eq(businessesTable.categoryId, categoryId));
    }

    const businesses = await query.where(and(...conditions));
    res.json(businesses);
  } catch (err) {
    req.log.error({ err }, "Failed to get businesses");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/businesses/me", requireAuth, async (req, res) => {
  try {
    const result = await db
      .select({
        id: businessesTable.id,
        clerkUserId: businessesTable.clerkUserId,
        name: businessesTable.name,
        description: businessesTable.description,
        address: businessesTable.address,
        phone: businessesTable.phone,
        categoryId: businessesTable.categoryId,
        categoryName: categoriesTable.name,
        imageUrl: businessesTable.imageUrl,
        isHidden: businessesTable.isHidden,
        createdAt: businessesTable.createdAt,
      })
      .from(businessesTable)
      .leftJoin(categoriesTable, eq(businessesTable.categoryId, categoriesTable.id))
      .where(eq(businessesTable.clerkUserId, req.userId!));

    if (!result[0]) {
      res.status(404).json({ error: "No business found" });
      return;
    }
    res.json(result[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to get my business");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/businesses", requireAuth, async (req, res) => {
  try {
    const { name, description, address, phone, categoryId, imageUrl } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const existing = await db
      .select({ id: businessesTable.id })
      .from(businessesTable)
      .where(eq(businessesTable.clerkUserId, req.userId!));

    if (existing.length > 0) {
      res.status(400).json({ error: "Business already exists for this user" });
      return;
    }

    const [business] = await db
      .insert(businessesTable)
      .values({
        clerkUserId: req.userId!,
        name,
        description: description ?? null,
        address: address ?? null,
        phone: phone ?? null,
        categoryId: categoryId ?? null,
        imageUrl: imageUrl ?? null,
      })
      .returning();

    const full = await getBusinessWithCategory(business.id);
    res.status(201).json(full);
  } catch (err) {
    req.log.error({ err }, "Failed to create business");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/businesses/me", requireAuth, async (req, res) => {
  try {
    const { name, description, address, phone, categoryId, imageUrl } = req.body;

    const existing = await db
      .select({ id: businessesTable.id })
      .from(businessesTable)
      .where(eq(businessesTable.clerkUserId, req.userId!));

    if (!existing[0]) {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    await db
      .update(businessesTable)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(categoryId !== undefined && { categoryId }),
        ...(imageUrl !== undefined && { imageUrl }),
      })
      .where(eq(businessesTable.clerkUserId, req.userId!));

    const full = await getBusinessWithCategory(existing[0].id);
    res.json(full);
  } catch (err) {
    req.log.error({ err }, "Failed to update business");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/businesses/:id", optionalAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const business = await getBusinessWithCategory(id);
    if (!business) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (business.isHidden && business.clerkUserId !== req.userId) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(business);
  } catch (err) {
    req.log.error({ err }, "Failed to get business");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/businesses/:id/visibility", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { isHidden } = req.body;
    if (typeof isHidden !== "boolean") {
      res.status(400).json({ error: "isHidden must be a boolean" });
      return;
    }

    await db
      .update(businessesTable)
      .set({ isHidden })
      .where(eq(businessesTable.id, id));

    const full = await getBusinessWithCategory(id);
    if (!full) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(full);
  } catch (err) {
    req.log.error({ err }, "Failed to toggle visibility");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
