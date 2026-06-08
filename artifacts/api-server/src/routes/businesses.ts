import { Router } from "express";
import { db } from "@workspace/db";
import { businessesTable, categoriesTable, productsTable } from "@workspace/db";
import { eq, and, or, ilike, inArray } from "drizzle-orm";
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
      city: businessesTable.city,
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

async function attachMinPrice<T extends { id: number }>(businesses: T[]) {
  const products = await db
    .select({ businessId: productsTable.businessId, price: productsTable.price })
    .from(productsTable);

  const minPriceByBusiness = new Map<number, number>();
  for (const p of products) {
    if (!p.price) continue;
    const numeric = parseInt(p.price.replace(/[^0-9]/g, ""), 10);
    if (!Number.isFinite(numeric) || numeric <= 0) continue;
    const current = minPriceByBusiness.get(p.businessId);
    if (current === undefined || numeric < current) {
      minPriceByBusiness.set(p.businessId, numeric);
    }
  }

  return businesses.map((b) => ({
    ...b,
    minPrice: minPriceByBusiness.get(b.id) ?? null,
  }));
}

router.get("/businesses", optionalAuth, async (req, res) => {
  try {
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    let query = db
      .select({
        id: businessesTable.id,
        clerkUserId: businessesTable.clerkUserId,
        name: businessesTable.name,
        description: businessesTable.description,
        address: businessesTable.address,
        city: businessesTable.city,
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
    if (search) {
      const pattern = `%${search}%`;
      const matchingBusinessIds = db
        .select({ businessId: productsTable.businessId })
        .from(productsTable)
        .where(ilike(productsTable.name, pattern));
      const searchCondition = or(
        ilike(businessesTable.name, pattern),
        ilike(businessesTable.description, pattern),
        inArray(businessesTable.id, matchingBusinessIds)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const businesses = await query.where(and(...conditions));
    const withMinPrice = await attachMinPrice(businesses);
    res.json(withMinPrice);
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
        city: businessesTable.city,
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
    const { name, description, address, city, phone, categoryId, imageUrl } = req.body;
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
        city: city ?? null,
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
    const { name, description, address, city, phone, categoryId, imageUrl } = req.body;

    const existing = await db
      .select({ id: businessesTable.id, isHidden: businessesTable.isHidden })
      .from(businessesTable)
      .where(eq(businessesTable.clerkUserId, req.userId!));

    if (!existing[0]) {
      res.status(404).json({ error: "Business not found" });
      return;
    }
    if (existing[0].isHidden) {
      res.status(403).json({ error: "Your page is hidden by the administrator" });
      return;
    }

    await db
      .update(businessesTable)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
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
    const isAdminUser = !!req.userId && req.userId === process.env.ADMIN_USER_ID;
    if (business.isHidden && !isAdminUser) {
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

router.get("/admin/businesses", requireAdmin, async (req, res) => {
  try {
    const businesses = await db
      .select({
        id: businessesTable.id,
        clerkUserId: businessesTable.clerkUserId,
        name: businessesTable.name,
        description: businessesTable.description,
        address: businessesTable.address,
        city: businessesTable.city,
        phone: businessesTable.phone,
        categoryId: businessesTable.categoryId,
        categoryName: categoriesTable.name,
        imageUrl: businessesTable.imageUrl,
        isHidden: businessesTable.isHidden,
        createdAt: businessesTable.createdAt,
      })
      .from(businessesTable)
      .leftJoin(categoriesTable, eq(businessesTable.categoryId, categoriesTable.id));

    const withMinPrice = await attachMinPrice(businesses);
    res.json(withMinPrice);
  } catch (err) {
    req.log.error({ err }, "Failed to get admin businesses");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
