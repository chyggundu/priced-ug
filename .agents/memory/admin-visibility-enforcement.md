---
name: Admin hide/unhide visibility enforcement
description: How "hidden" business pages must be gated across API + admin list, and why UI-only blocking fails
---

# Hiding business pages (admin moderation)

When an admin hides a business (`isHidden=true`), it must become inaccessible to BOTH the public and the owner.

**Rule 1 — Admin management lists need their own unfiltered endpoint.**
The public list endpoint always filters `isHidden=false`. If the admin panel reuses it, a hidden business disappears from the admin's own list and can never be unhidden. The admin panel must use a dedicated admin-only endpoint that returns ALL businesses including hidden.
**Why:** discovered the unhide flow was impossible because hiding removed the row from the admin's view.

**Rule 2 — Enforce hidden-state on the server, never UI-only.**
A "Page Hidden" notice on the owner screen is bypassable via deep links / direct API calls. Hidden-state must be enforced in route handlers:
- Owner mutation routes (edit business, create/edit/delete products) → 403 when their business `isHidden`.
- Public detail + public products read routes → 404 when the business `isHidden`, EXCEPT the admin user (so admin can still preview before unhiding).
**How to apply:** admin = `req.userId === process.env.ADMIN_USER_ID`; public reads use `optionalAuth` so they can detect the admin and allow preview.
