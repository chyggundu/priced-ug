/**
 * Clerk keys are environment-bound: a `pk_live_` key is rejected by Clerk on any
 * host other than the production domain, and a `pk_test_` key belongs to the
 * development instance. So `.env.local` holds the development key and the
 * production host supplies the live one — never the other way round.
 *
 * When the key is absent the site still has to work: these pages are the public
 * website first, and auth is an add-on. Everything guards on `isClerkConfigured`
 * rather than mounting Clerk and letting it throw.
 */
export const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export const isClerkConfigured = clerkPublishableKey.length > 0;
