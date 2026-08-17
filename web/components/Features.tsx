import { features } from "@/content/site";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-20 bg-brand-50 bg-[radial-gradient(40rem_28rem_at_85%_0%,var(--color-brand-100),transparent_70%)] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to buy and sell locally"
          body="No clutter, no complicated checkout. Just the details that matter when you are deciding where to shop."
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <li key={feature.title}>
              <Reveal delay={(i % 3) * 90} className="h-full">
                <div className="group h-full rounded-2xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/10">
                  <span className="inline-flex size-9 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand-500 tabular-nums ring-1 ring-brand-100 transition group-hover:bg-brand-500 group-hover:text-white group-hover:ring-brand-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-lg font-bold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {feature.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
