import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, businessesTable } from "@workspace/db";
import { eq, and, or, ilike } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../lib/auth";

const router = Router();

router.get("/products/search", async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!q) {
      res.json([]);
      return;
    }

    const pattern = `%${q}%`;
    const results = await db
      .select({
        id: productsTable.id,
        businessId: productsTable.businessId,
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
      .where(
        and(
          eq(businessesTable.isHidden, false),
          or(
            ilike(productsTable.name, pattern),
            ilike(productsTable.description, pattern),
            ilike(productsTable.size, pattern),
            ilike(productsTable.materials, pattern)
          )
        )
      )
      .orderBy(productsTable.createdAt);

    res.json(results);
  } catch (err) {
    req.log.error({ err }, "Failed to search products");
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
      .select()
      .from(productsTable)
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

    const { name, description, price, imageUrl, size, materials } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const [product] = await db
      .insert(productsTable)
      .values({
        businessId: business[0].id,
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

    const { name, description, price, imageUrl, size, materials } = req.body;
    const [updated] = await db
      .update(productsTable)
      .set({
        ...(name !== undefined && { name }),
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
