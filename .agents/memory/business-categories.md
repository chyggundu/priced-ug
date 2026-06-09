---
name: Categories belong to products; business categories are derived
description: Where category membership lives (per-product) and how a business's category list is computed
---

# Categories live on products, not businesses

Category membership is per **product** (`products.categoryId`, nullable FK).
A business has NO stored category — its category list is **derived** at read
time from the distinct categories of its products.
**Why:** the product is item-centric — browse/search show a grid of items, each
item appears only under its own category, and a business surfaces under every
category any of its items belong to.

## Deriving business categories
`attachCategories` in `businesses.ts` selects DISTINCT categories by joining
`products` → `categories` for the given business ids, and attaches a
`categories: BusinessCategory[]` array. There is no `business_categories` join
table write path and no `businesses.categoryId` write path anymore.

## Legacy columns — present but dead
`businesses.categoryId` (nullable) and the `business_categories` table still
exist in the DB but are **never written or read**. The API contract no longer
exposes business-level `categoryId` / `categoryName` / `categoryIds` (removed
from `Business`, `CreateBusinessInput`, `UpdateBusinessInput`). Do not
reintroduce them — the single source of truth is product categories.

## Contract shape
`Business.categories` uses a dedicated lightweight `BusinessCategory` schema
(`id`, `name` only) — NOT the full `Category` schema (which requires `createdAt`).
**Why:** the derived join attaches only id+name; referencing `Category` made
generated zod validators expect `createdAt` and broke strict consumers.

## Product category write invariants
`CreateProductInput.categoryId` is **required**; `UpdateProductInput.categoryId`
is optional. On create/update the server validates the categoryId exists (400 if
not) before writing.

## Filtering
- `GET /products?categoryId=X&q=...` is the item-centric listing (visible
  businesses only, joins category + business info).
- `GET /businesses?categoryId=X` filters businesses by membership via a
  `selectDistinct` subquery over `products` (a business matches if any of its
  products is in category X).
