import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, businessesTable, categoriesTable } from "@workspace/db";
import { eq, and, or, ilike, desc, type SQL } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../lib/auth";

const router = Router();

router.get("/products", async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;

    const conditions: SQL[] = [eq(businessesTable.isHidden, false)];

    if (categoryId && Number.isInteger(categoryId)) {
      conditions.push(eq(productsTable.categoryId, categoryId));
    }

    if (q) {
      const pattern = `%${q}%`;
      const searchCondition = or(
        ilike(productsTable.name, pattern),
        ilike(productsTable.description, pattern),
        ilike(productsTable.size, pattern),
        ilike(productsTable.materials, pattern)
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    const results = await db
      .select({
        id: productsTable.id,
        businessId: productsTable.businessId,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        imageUrl: productsTable.imageUrl,
        size: productsTable.size,
        materials: productsTable.materials,
        createdAt: productsTable.createdAt,
        businessName: businessesTable.name,
        businessImageUrl: businessesTable.imageUrl,
        businessCity: businessesTable.city,
      })
      .from(productsTable)
      .innerJoin(businessesTable, eq(productsTable.businessId, businessesTable.id))
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(...conditions))
      .orderBy(desc(productsTable.createdAt));

    res.json(results);
  } catch (err) {
    req.log.error({ err }, "Failed to list products");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/businesses/:businessId/products", optionalAuth, async (req, res) => {
  try {
    const businessId = parseInt(req.params.businessId);
    const biz = await db
      .select({ isHidden: businessesTable.isHidden })
      .from(businessesTable)
      .where(eq(businessesTable.id, businessId));

    if (!biz[0]) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const isAdminUser = !!req.userId && req.userId === process.env.ADMIN_USER_ID;
    if (biz[0].isHidden && !isAdminUser) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const products = await db
      .select({
        id: productsTable.id,
        businessId: productsTable.businessId,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        imageUrl: productsTable.imageUrl,
        size: productsTable.size,
        materials: productsTable.materials,
        createdAt: productsTable.createdAt,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.businessId, businessId))
      .orderBy(productsTable.createdAt);
    res.json(products);
  } catch (err) {
    req.log.error({ err }, "Failed to get products");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/businesses/me/products", requireAuth, async (req, res) => {
  try {
    const business = await db
      .select({ id: businessesTable.id })
      .from(businessesTable)
      .where(eq(businessesTable.clerkUserId, req.userId!));

    if (!business[0]) {
      res.json([]);
      return;
    }

    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.businessId, business[0].id))
      .orderBy(productsTable.createdAt);
    res.json(products);
  } catch (err) {
    req.log.error({ err }, "Failed to get my products");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/businesses/me/products", requireAuth, async (req, res) => {
  try {
    const business = await db
      .select({ id: businessesTable.id, isHidden: businessesTable.isHidden })
      .from(businessesTable)
      .where(eq(businessesTable.clerkUserId, req.userId!));

    if (!business[0]) {
      res.status(404).json({ error: "Create a business page first" });
      return;
    }
    if (business[0].isHidden) {
      res.status(403).json({ error: "Your page is hidden by the administrator" });
      return;
    }

    const { name, categoryId, description, price, imageUrl, size, materials } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const parsedCategoryId = typeof categoryId === "number" ? categoryId : parseInt(String(categoryId), 10);
    if (!Number.isInteger(parsedCategoryId)) {
      res.status(400).json({ error: "categoryId is required" });
      return;
    }
    const category = await db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(eq(categoriesTable.id, parsedCategoryId));
    if (!category[0]) {
      res.status(400).json({ error: "categoryId does not exist" });
      return;
    }

    const [product] = await db
      .insert(productsTable)
      .values({
        businessId: business[0].id,
        categoryId: parsedCategoryId,
        name,
        description: description ?? null,
        price: price ?? null,
        imageUrl: imageUrl ?? null,
        size: size ?? null,
        materials: materials ?? null,
      })
      .returning();

    res.status(201).json(product);
  } catch (err) {
    req.log.error({ err }, "Failed to create product");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/businesses/me/products/:productId", requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);

    const business = await db
      .select({ id: businessesTable.id, isHidden: businessesTable.isHidden })
      .from(businessesTable)
      .where(eq(businessesTable.clerkUserId, req.userId!));

    if (!business[0]) {
      res.status(404).json({ error: "Business not found" });
      return;
    }
    if (business[0].isHidden) {
      res.status(403).json({ error: "Your page is hidden by the administrator" });
      return;
    }

    const existing = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, productId));

    if (!existing[0] || existing[0].businessId !== business[0].id) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const { name, categoryId, description, price, imageUrl, size, materials } = req.body;

    let parsedCategoryId: number | undefined;
    if (categoryId !== undefined && categoryId !== null) {
      parsedCategoryId = typeof categoryId === "number" ? categoryId : parseInt(String(categoryId), 10);
      if (!Number.isInteger(parsedCategoryId)) {
        res.status(400).json({ error: "categoryId must be an integer" });
        return;
      }
      const category = await db
        .select({ id: categoriesTable.id })
        .from(categoriesTable)
        .where(eq(categoriesTable.id, parsedCategoryId));
      if (!category[0]) {
        res.status(400).json({ error: "categoryId does not exist" });
        return;
      }
    }

    const [updated] = await db
      .update(productsTable)
      .set({
        ...(name !== undefined && { name }),
        ...(parsedCategoryId !== undefined && { categoryId: parsedCategoryId }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(size !== undefined && { size }),
        ...(materials !== undefined && { materials }),
      })
      .where(eq(productsTable.id, productId))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/businesses/me/products/:productId", requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);

    const business = await db
      .select({ id: businessesTable.id, isHidden: businessesTable.isHidden })
      .from(businessesTable)
      .where(eq(businessesTable.clerkUserId, req.userId!));

    if (!business[0]) {
      res.status(404).json({ error: "Business not found" });
      return;
    }
    if (business[0].isHidden) {
      res.status(403).json({ error: "Your page is hidden by the administrator" });
      return;
    }

    const existing = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, productId));

    if (!existing[0] || existing[0].businessId !== business[0].id) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    await db.delete(productsTable).where(eq(productsTable.id, productId));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete product");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
