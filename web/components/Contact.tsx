import { links } from "@/content/site";
import { Reveal } from "./Reveal";
import { StoreButtons } from "./StoreButtons";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "./icons";

const CONTACT_LINK =
  "inline-flex items-center gap-2.5 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/20 transition duration-300 hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-20 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-500 to-brand-700 px-7 py-14 text-white sm:px-12 md:py-20">
            {/* Slow-moving highlight so the panel is not a flat block of red. */}
            <div
              aria-hidden
              className="animate-drift pointer-events-none absolute -top-24 -right-16 size-[26rem] rounded-full bg-white/10 blur-3xl"
            />

            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                Get Priced Ug on your phone
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-white/85">
                Free to download. Free to browse. Whether you are looking for a
                price or listing your shop, it takes one tap to start.
              </p>

              <div className="mt-9 flex justify-center">
                <StoreButtons surface="dark" />
              </div>

              <div className="mt-10 border-t border-white/20 pt-8">
                <p className="text-sm font-semibold text-white/70">
                  Questions, or want your business listed?
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <a href={`mailto:${links.email}`} className={CONTACT_LINK}>
                    <MailIcon className="size-4" />
                    {links.email}
                  </a>

                  {links.whatsapp && (
                    <a
                      href={`https://wa.me/${links.whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className={CONTACT_LINK}
                    >
                      <WhatsAppIcon className="size-4" />
                      WhatsApp
                    </a>
                  )}

                  {links.phone && (
                    <a href={`tel:${links.phone}`} className={CONTACT_LINK}>
                      <PhoneIcon className="size-4" />
                      {links.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
