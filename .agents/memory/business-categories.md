---
name: Business ↔ categories many-to-many
description: How a business relates to categories and the invariants that writes must preserve
---

# Business ↔ categories (many-to-many)

A business belongs to many categories via the `business_categories` join table
(FK cascade both sides, unique composite on (businessId, categoryId)).

## Legacy columns kept on purpose
`businesses.categoryId` / `categoryName` are retained and always set to the
**first** selected category. API responses still expose them alongside the full
`categories` array.
**Why:** backward compatibility for any consumer reading the single-category
fields; avoids a breaking contract change.
**How to apply:** on create/update, set `categoryId = categoryIds[0] ?? null`
in lockstep with replacing join rows.

## Write invariants (create + update)
1. **Validate first:** reject with 400 if any submitted `categoryId` does not
   exist (existence check against `categories`), before mutating anything.
2. **Atomic:** wrap the business row update AND the join-row delete+insert in a
   single `db.transaction`. The replace is delete-then-insert, so a non-atomic
   path can leave a business with cleared/partial categories if the insert fails.
**Why:** a past review flagged that non-transactional delete+insert + unvalidated
IDs could corrupt category assignments (orphaned/empty join rows + mismatched
legacy `categoryId`).

## Contract shape
`Business.categories` uses a dedicated lightweight `BusinessCategory` schema
(`id`, `name` only) — NOT the full `Category` schema (which requires `createdAt`).
**Why:** the server attaches only id+name; referencing `Category` made generated
zod validators expect `createdAt` and broke strict consumers.

## Filtering
`GET /businesses?categoryId=X` filters by join-table membership (subquery), so a
business shows under every category it belongs to — not just its legacy one.
