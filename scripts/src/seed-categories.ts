import { db, categoriesTable } from "@workspace/db";

const DEFAULT_CATEGORIES = [
  "Restaurants",
  "Building Materials",
  "Home Appliances",
  "Schools",
  "Hotels",
  "Clothing & Garments",
  "Beddings",
  "Houses for Rent",
  "Electricals",
  "Electronics",
  "Furniture",
  "Grocery & Food",
  "Hardware",
  "Pharmacy",
  "AB&B",
  "Saloons",
  "Bridal",
  "Party rentals",
  "Tilers",
  "Plumbers",
  "Car rental",
];

async function seed() {
  console.log("Seeding categories...");
  for (const name of DEFAULT_CATEGORIES) {
    await db
      .insert(categoriesTable)
      .values({ name })
      .onConflictDoNothing();
  }
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
