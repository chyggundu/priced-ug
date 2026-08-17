import { AuthShell } from "./AuthShell";

/**
 * Shown in place of an auth form when no Clerk key is configured for this build.
 * The usual cause is running locally without a development key: Clerk rejects a
 * `pk_live_` key anywhere but the production domain.
 */
export function AuthUnavailable() {
  return (
    <AuthShell
      tagline="Find the best deals in Uganda"
      title="Sign-in is not available here"
      subtitle="This build has no Clerk key configured, so accounts are switched off."
    >
      <p className="rounded-[10px] bg-brand-100 px-4 py-3 text-sm text-brand-600">
        Set <code className="font-mono">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> in{" "}
        <code className="font-mono">web/.env.local</code> to the Clerk{" "}
        <strong>development</strong> key (<code className="font-mono">pk_test_…</code>) for local
        work. The production key belongs on the deployed host only.
      </p>
    </AuthShell>
  );
}
