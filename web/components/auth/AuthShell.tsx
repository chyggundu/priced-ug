import Link from "next/link";
import { site } from "@/content/site";

/**
 * The chrome around every auth screen — logo mark, app name, tagline — mirroring
 * the mobile app's (auth) screens so signing in on the web feels like the app.
 */
export function AuthShell({
  tagline,
  title,
  subtitle,
  children,
}: {
  tagline: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center">
          <Link
            href="/"
            aria-label={`${site.name} home`}
            className="flex size-16 items-center justify-center rounded-full bg-brand-500 transition duration-300 hover:scale-105"
          >
            <span className="text-3xl font-bold text-white">P</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{site.name}</h1>
          <p className="mt-1 text-sm text-ink-400">{tagline}</p>
        </div>

        <h2 className="mt-10 text-xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1.5 text-sm text-ink-600">{subtitle}</p>}

        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

/** Shared field/button styling, so the three auth screens stay identical. */
export const inputClass =
  "w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

export const buttonClass =
  "w-full rounded-[10px] bg-brand-500 px-4 py-3 text-[15px] font-semibold text-white transition duration-300 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50";

export const linkClass =
  "text-sm font-medium text-brand-500 transition hover:text-brand-600";

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-[10px] bg-brand-100 px-3 py-2 text-sm text-brand-600">
      {message}
    </p>
  );
}
