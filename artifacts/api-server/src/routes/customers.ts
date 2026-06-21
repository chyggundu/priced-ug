import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { customersTable, businessesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { SaveMyCustomerProfileBody, LookupCustomerBody } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

const customerColumns = {
  id: customersTable.id,
  fullName: customersTable.fullName,
  phone: customersTable.phone,
  district: customersTable.district,
  town: customersTable.town,
  village: customersTable.village,
  street: customersTable.street,
  latitude: customersTable.latitude,
  longitude: customersTable.longitude,
  createdAt: customersTable.createdAt,
  updatedAt: customersTable.updatedAt,
};

router.get("/customers/me", requireAuth, async (req, res) => {
  try {
    const [customer] = await db
      .select(customerColumns)
      .from(customersTable)
      .where(eq(customersTable.clerkUserId, req.userId!));

    if (!customer) {
      res.status(404).json({ error: "No customer profile found" });
      return;
    }
    res.json(customer);
  } catch (err) {
    req.log.error({ err }, "Failed to get customer profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/customers/me", requireAuth, async (req, res) => {
  try {
    const parsed = SaveMyCustomerProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
      return;
    }
    const { fullName, phone, district, town, village, street, latitude, longitude } = parsed.data;

    const values = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      district: district.trim(),
      town: town?.trim() || null,
      village: village?.trim() || null,
      street: street?.trim() || null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    };

    if (!values.fullName || !values.phone || !values.district) {
      res.status(400).json({ error: "Full name, phone, and district are required" });
      return;
    }

    const [customer] = await db
      .insert(customersTable)
      .values({ clerkUserId: req.userId!, ...values })
      .onConflictDoUpdate({
        target: customersTable.clerkUserId,
        set: values,
      })
      .returning(customerColumns);

    res.json(customer);
  } catch (err) {
    req.log.error({ err }, "Failed to save customer profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/customers/lookup", requireAuth, async (req, res) => {
  try {
    const isAdminUser = req.userId === process.env.ADMIN_USER_ID;
    if (!isAdminUser) {
      const [business] = await db
        .select({ id: businessesTable.id })
        .from(businessesTable)
        .where(eq(businessesTable.clerkUserId, req.userId!));
      if (!business) {
        res.status(403).json({ error: "Only business owners can look up customers" });
        return;
      }
    }

    const parsed = LookupCustomerBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
      return;
    }
    const phone = parsed.data.phone.trim();
    const district = parsed.data.district.trim();

    if (!phone || !district) {
      res.status(400).json({ error: "Phone and district are required" });
      return;
    }

    const [customer] = await db
      .select(customerColumns)
      .from(customersTable)
      .where(and(eq(customersTable.phone, phone), eq(customersTable.district, district)));

    if (!customer) {
      res.status(404).json({ error: "No matching customer" });
      return;
    }
    res.json(customer);
  } catch (err) {
    req.log.error({ err }, "Failed to look up customer");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/customers", requireAdmin, async (req, res) => {
  try {
    const customers = await db
      .select(customerColumns)
      .from(customersTable)
      .orderBy(desc(customersTable.createdAt));
    res.json(customers);
  } catch (err) {
    req.log.error({ err }, "Failed to list customers");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
