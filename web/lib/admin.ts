/**
 * Admin is decided by verified email, matching the mobile app's AuthContext and
 * the Supabase `is_admin()` function. A Clerk user id would not survive an
 * instance switch (dev and production issue different ids), an email does.
 *
 * The parameter is typed structurally rather than as Clerk's UserResource:
 * @clerk/types is a transitive dependency, and this only needs the email list.
 */
type EmailBearing = {
  emailAddresses: { emailAddress: string; verification?: { status?: string | null } | null }[];
};

const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "priceduganda@gmail.com"
).toLowerCase();

export function isAdminUser(user: EmailBearing | null | undefined): boolean {
  if (!user) return false;
  return user.emailAddresses.some(
    (email) =>
      email.emailAddress.toLowerCase() === ADMIN_EMAIL &&
      email.verification?.status === "verified",
  );
}
