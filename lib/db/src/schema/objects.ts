import { pgTable, text, timestamp, customType } from "drizzle-orm/pg-core";

// Raw binary column. Postgres `bytea` <-> Node Buffer.
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

// Uploaded images (business/product photos) stored directly in Postgres, so no
// external object-storage bucket is required. Served via GET /api/storage/objects/<id>.
export const objectsTable = pgTable("objects", {
  id: text("id").primaryKey(),
  contentType: text("content_type").notNull(),
  bytes: bytea("bytes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
