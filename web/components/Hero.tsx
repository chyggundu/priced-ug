import Image from "next/image";
import { StoreButtons } from "./StoreButtons";

const STATS = [
  { value: "UGX", label: "Real prices, listed upfront" },
  { value: "1 tap", label: "To call a business" },
  { value: "0", label: "Sign-ups to start browsing" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative drifting colour wash. Sits behind everything, never interactive. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-drift absolute -top-40 -right-24 size-[38rem] rounded-full bg-brand-200/45 blur-3xl" />
        <div
          className="animate-drift absolute -bottom-52 -left-32 size-[32rem] rounded-full bg-brand-100/70 blur-3xl"
          style={{ animationDelay: "-8s" }}
        />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:py-24 lg:grid-cols-2 lg:gap-8">
        <div>
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-brand-100 px-3.5 py-1.5 text-xs font-semibold text-brand-600 ring-1 ring-brand-200/70">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-brand-500" />
            </span>
            Free to browse — no sign-in needed
          </span>

          <h1
            className="animate-fade-up mt-5 text-4xl leading-[1.1] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "90ms" }}
          >
            Find local businesses.{" "}
            <span className="bg-gradient-to-br from-brand-500 to-brand-700 bg-clip-text text-transparent">
              See real prices.
            </span>{" "}
            Call in one tap.
          </h1>

          <p
            className="animate-fade-up mt-5 max-w-xl text-lg leading-relaxed text-ink-600"
            style={{ animationDelay: "180ms" }}
          >
            Priced Ug is a business directory and marketplace for Uganda. Browse
            shops by category, see every product with its price in UGX, and reach
            the owner instantly — no haggling just to find out what something
            costs.
          </p>

          <div className="animate-fade-up mt-8" id="download" style={{ animationDelay: "270ms" }}>
            <StoreButtons />
          </div>

          <dl
            className="animate-fade-up mt-10 grid max-w-lg grid-cols-3 gap-5 border-t border-line pt-8"
            style={{ animationDelay: "360ms" }}
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-extrabold text-brand-500">{stat.value}</dt>
                <dd className="mt-1 text-xs leading-snug text-ink-600">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div
            className="animate-fade-up relative"
            style={{ animationDelay: "220ms" }}
          >
            <div className="animate-float">
              {/* Brand glow so the white app screen lifts off the pale background. */}
              <div
                aria-hidden
                className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-brand-500/20 blur-2xl"
              />
              <Image
                src="/screenshots/browse.png"
                alt="The Priced Ug app showing local products with prices in Ugandan shillings"
                width={864}
                height={1517}
                priority
                className="w-full max-w-[19rem] rounded-3xl shadow-2xl shadow-black/15 ring-1 ring-black/10"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
