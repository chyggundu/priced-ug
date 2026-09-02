import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { type Block, privacyMeta, privacySections } from "@/content/privacy";
import { links, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects your personal data.`,
  alternates: { canonical: "/privacy" },
};

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) =>
        block.type === "p" ? (
          <p key={i} className="mt-4 text-[15px] leading-relaxed text-ink-600">
            {block.text}
          </p>
        ) : (
          <ul key={i} className="mt-4 space-y-2.5">
            {block.items.map((item, j) => {
              // Some entries run straight into punctuation ("…our Service" + ", including
              // to monitor…"); others need a space after the bold lead-in ("Account" +
              // "means a unique account…").
              const spaceAfterLead = item.lead ? !/^[,:.]/.test(item.text) : false;

              return (
                <li
                  key={j}
                  className="relative pl-6 text-[15px] leading-relaxed text-ink-600 before:absolute before:top-[0.6em] before:left-1.5 before:size-1.5 before:rounded-full before:bg-brand-500"
                >
                  {item.lead && (
                    <strong className="font-semibold text-ink-900">{item.lead}</strong>
                  )}
                  {spaceAfterLead && " "}
                  {item.text}
                </li>
              );
            })}
          </ul>
        ),
      )}
    </>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <Nav />

      <main className="mx-auto max-w-3xl px-5 py-14 md:py-20">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-ink-400">
          Last updated: {privacyMeta.lastUpdated}
        </p>

        {privacyMeta.intro.map((paragraph) => (
          <p
            key={paragraph.slice(0, 40)}
            className="mt-4 text-[15px] leading-relaxed text-ink-600"
          >
            {paragraph}
          </p>
        ))}

        {/* Keyed by index: the source policy repeats the "Usage Data" heading, so
            the heading itself is not unique. */}
        {privacySections.map((section, i) => (
          <section key={i} className="mt-10">
            {section.level === 2 ? (
              <h2 className="border-b border-line pb-3 text-2xl font-bold tracking-tight">
                {section.heading}
              </h2>
            ) : (
              <h3 className="text-lg font-bold tracking-tight">{section.heading}</h3>
            )}
            <Blocks blocks={section.blocks} />
          </section>
        ))}

        <section className="mt-10">
          <h2 className="border-b border-line pb-3 text-2xl font-bold tracking-tight">
            Contact Us
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-600">
            If you have any questions about this Privacy Policy, You can contact us:
          </p>
          <ul className="mt-4">
            <li className="relative pl-6 text-[15px] leading-relaxed text-ink-600 before:absolute before:top-[0.6em] before:left-1.5 before:size-1.5 before:rounded-full before:bg-brand-500">
              By email:{" "}
              <a
                href={`mailto:${links.email}`}
                className="font-medium text-brand-500 underline underline-offset-4 hover:text-brand-600"
              >
                {links.email}
              </a>
            </li>
          </ul>
        </section>
      </main>

      <Footer />
    </>
  );
}
