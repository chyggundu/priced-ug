import { db, categoriesTable } from "@workspace/db";

const DEFAULT_CATEGORIES = [
  "AB&B",
  "Animal Feeds and Farm Inputs",
  "Apartments For Rent",
  "Beddings",
  "Boda Boda Parts",
  "Bookshops",
  "Bridal",
  "Building Materials",
  "Car Rental",
  "Car Spare Parts",
  "Clothing & Garments",
  "Electricals",
  "Electronics",
  "Furniture",
  "Grocery & Food",
  "Hardware",
  "Home Appliances",
  "Hotels",
  "Metal Fabrication",
  "Miscellaneous",
  "Party Rentals",
  "Personal Effects",
  "Pharmacy",
  "Phones and Accessories",
  "Plumbers",
  "Restaurants",
  "Saloons",
  "Schools",
  "Security And Video Surveillance",
  "Services",
  "Shoes",
  "Tilers",
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
