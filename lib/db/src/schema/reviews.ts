import { pgTable, serial, text, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reviewsTable = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    businessId: integer("business_id").notNull(),
    userId: text("user_id").notNull(),
    authorName: text("author_name").notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    reply: text("reply"),
    repliedAt: timestamp("replied_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("reviews_business_user_unique").on(table.businessId, table.userId)],
);

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({
  id: true,
  reply: true,
  repliedAt: true,
  createdAt: true,
});
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
