import { Router } from "express";
import { db } from "@workspace/db";
import { businessesTable, categoriesTable, productsTable } from "@workspace/db";
import { eq, and, or, ilike, inArray } from "drizzle-orm";
import { requireAuth, requireAdmin, optionalAuth } from "../lib/auth";

const router = Router();

type BusinessCategory = { id: number; name: string };

async function attachCategories<T extends { id: number }>(
  businesses: T[],
): Promise<(T & { categories: BusinessCategory[] })[]> {
  if (businesses.length === 0) return [];
  const ids = businesses.map((b) => b.id);
  // Categories are derived from the categories of a business's products.
  const rows = await db
    .selectDistinct({
      businessId: productsTable.businessId,
      categoryId: categoriesTable.id,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(inArray(productsTable.businessId, ids));

  const byBusiness = new Map<number, BusinessCategory[]>();
  for (const row of rows) {
    const list = byBusiness.get(row.businessId) ?? [];
    list.push({ id: row.categoryId, name: row.categoryName });
    byBusiness.set(row.businessId, list);
  }
  return businesses.map((b) => ({ ...b, categories: byBusiness.get(b.id) ?? [] }));
}

async function attachCategoriesOne<T extends { id: number }>(
  business: T | null,
): Promise<(T & { categories: BusinessCategory[] }) | null> {
  if (!business) return null;
  const [withCats] = await attachCategories([business]);
  return withCats ?? null;
}

function validateCoordinates(latitude: unknown, longitude: unknown): string | null {
  const latProvided = latitude !== undefined && latitude !== null;
  const lngProvided = longitude !== undefined && longitude !== null;
  if (latProvided !== lngProvided) {
    return "latitude and longitude must be provided together";
  }
  if (latProvided) {
    if (typeof latitude !== "number" || latitude < -90 || latitude > 90) {
      return "latitude must be a number between -90 and 90";
    }
    if (typeof longitude !== "number" || longitude < -180 || longitude > 180) {
      return "longitude must be a number between -180 and 180";
    }
  }
  return null;
}

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
      imageUrl: businessesTable.imageUrl,
      latitude: businessesTable.latitude,
      longitude: businessesTable.longitude,
      isHidden: businessesTable.isHidden,
      createdAt: businessesTable.createdAt,
    })
    .from(businessesTable)
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
        imageUrl: businessesTable.imageUrl,
        latitude: businessesTable.latitude,
        longitude: businessesTable.longitude,
        isHidden: businessesTable.isHidden,
        createdAt: businessesTable.createdAt,
      })
      .from(businessesTable);

    const conditions = [eq(businessesTable.isHidden, false)];
    if (categoryId) {
      const inCategory = db
        .selectDistinct({ businessId: productsTable.businessId })
        .from(productsTable)
        .where(eq(productsTable.categoryId, categoryId));
      conditions.push(inArray(businessesTable.id, inCategory));
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
    const withCats = await attachCategories(withMinPrice);
    res.json(withCats);
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
        imageUrl: businessesTable.imageUrl,
        latitude: businessesTable.latitude,
        longitude: businessesTable.longitude,
        isHidden: businessesTable.isHidden,
        createdAt: businessesTable.createdAt,
      })
      .from(businessesTable)
      .where(eq(businessesTable.clerkUserId, req.userId!));

    if (!result[0]) {
      res.status(404).json({ error: "No business found" });
      return;
    }
    res.json(await attachCategoriesOne(result[0]));
  } catch (err) {
    req.log.error({ err }, "Failed to get my business");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/businesses", requireAuth, async (req, res) => {
  try {
    const { name, description, address, city, phone, imageUrl, latitude, longitude } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }
    const coordError = validateCoordinates(latitude, longitude);
    if (coordError) {
      res.status(400).json({ error: coordError });
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
        imageUrl: imageUrl ?? null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      })
      .returning();

    const full = await attachCategoriesOne(await getBusinessWithCategory(business.id));
    res.status(201).json(full);
  } catch (err) {
    req.log.error({ err }, "Failed to create business");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/businesses/me", requireAuth, async (req, res) => {
  try {
    const { name, description, address, city, phone, imageUrl, latitude, longitude } = req.body;

    const coordError = validateCoordinates(latitude, longitude);
    if (coordError) {
      res.status(400).json({ error: coordError });
      return;
    }

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

    const businessId = existing[0].id;
    await db
      .update(businessesTable)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(phone !== undefined && { phone }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
      })
      .where(eq(businessesTable.clerkUserId, req.userId!));

    const full = await attachCategoriesOne(await getBusinessWithCategory(businessId));
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
    res.json(await attachCategoriesOne(business));
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

    const full = await attachCategoriesOne(await getBusinessWithCategory(id));
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
        imageUrl: businessesTable.imageUrl,
        latitude: businessesTable.latitude,
        longitude: businessesTable.longitude,
        isHidden: businessesTable.isHidden,
        createdAt: businessesTable.createdAt,
      })
      .from(businessesTable);

    const withMinPrice = await attachMinPrice(businesses);
    const withCats = await attachCategories(withMinPrice);
    res.json(withCats);
  } catch (err) {
    req.log.error({ err }, "Failed to get admin businesses");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
