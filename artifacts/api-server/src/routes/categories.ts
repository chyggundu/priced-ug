import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

router.get("/categories", async (req, res) => {
  try {
    const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
    res.json(categories);
  } catch (err) {
    req.log.error({ err }, "Failed to get categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/categories", requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "Name is required" });
      return;
    }
    const normalized = name
      .trim()
      .split(/\s+/)
      .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
      .join(" ");
    const [category] = await db.insert(categoriesTable).values({ name: normalized }).returning();
    res.status(201).json(category);
  } catch (err) {
    req.log.error({ err }, "Failed to create category");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/categories/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete category");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
