import Image from "next/image";
import { screenshots } from "@/content/site";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Screenshots() {
  return (
    <section className="overflow-hidden bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="The app"
          title="A look inside"
          body="Clean, fast, and built for the way people actually shop in Uganda."
        />
      </div>

      {/* Scrolls horizontally on small screens rather than squashing the phones. */}
      <div className="mt-12 overflow-x-auto pb-4">
        <ul className="mx-auto flex w-max max-w-6xl gap-6 px-5">
          {screenshots.map((shot, i) => (
            <li key={shot.src} className="w-52 shrink-0 sm:w-60">
              <Reveal delay={i * 80}>
                <div className="group">
                  <div className="overflow-hidden rounded-2xl shadow-lg shadow-black/10 ring-1 ring-black/10 transition duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-brand-500/20">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      width={864}
                      height={1517}
                      className="w-full transition duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                  <p className="mt-4 text-sm font-medium text-ink-600">
                    {shot.caption}
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
