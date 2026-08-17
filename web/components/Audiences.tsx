import { audiences } from "@/content/site";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { CheckIcon } from "./icons";

export function Audiences() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="How it works"
          title="One app, built for three kinds of people"
          body="Whether you are hunting for a price, running a shop, or waiting on a delivery, Priced Ug is shaped around what you actually need to do."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {audiences.map((audience, i) => (
            <Reveal key={audience.id} delay={i * 90} className="h-full">
              <article className="group flex h-full flex-col rounded-2xl border border-line bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/10">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold tracking-tight">{audience.title}</h3>
                  <span className="shrink-0 rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-semibold text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
                    {audience.badge}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-ink-600">
                  {audience.summary}
                </p>

                <ul className="mt-6 space-y-5 border-t border-line pt-6">
                  {audience.points.map((point) => (
                    <li key={point.title} className="flex gap-3">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-500">
                        <CheckIcon className="size-3 text-white" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{point.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-ink-600">
                          {point.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
