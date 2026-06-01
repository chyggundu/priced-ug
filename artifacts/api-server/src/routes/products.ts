import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, businessesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/businesses/:businessId/products", async (req, res) => {
  try {
    const businessId = parseInt(req.params.businessId);
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
      .select({ id: businessesTable.id })
      .from(businessesTable)
      .where(eq(businessesTable.clerkUserId, req.userId!));

    if (!business[0]) {
      res.status(404).json({ error: "Create a business page first" });
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
      .select({ id: businessesTable.id })
      .from(businessesTable)
      .where(eq(businessesTable.clerkUserId, req.userId!));

    if (!business[0]) {
      res.status(404).json({ error: "Business not found" });
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
      .select({ id: businessesTable.id })
      .from(businessesTable)
      .where(eq(businessesTable.clerkUserId, req.userId!));

    if (!business[0]) {
      res.status(404).json({ error: "Business not found" });
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
