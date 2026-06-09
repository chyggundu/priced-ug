import { pgTable, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";
import { categoriesTable } from "./categories";

export const businessCategoriesTable = pgTable(
  "business_categories",
  {
    id: serial("id").primaryKey(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categoriesTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("business_categories_unique").on(table.businessId, table.categoryId)],
);

export type BusinessCategory = typeof businessCategoriesTable.$inferSelect;
