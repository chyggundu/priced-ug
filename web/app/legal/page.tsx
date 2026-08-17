import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import {
  LEGAL_AGREEMENT_INTRO,
  LEGAL_AGREEMENT_SECTIONS,
  LEGAL_AGREEMENT_TITLE,
} from "@/content/legal";

export const metadata: Metadata = {
  title: "User Agreement",
  description: LEGAL_AGREEMENT_TITLE,
};

/** Mirrors the mobile app's legal screen — the same agreement, same wording. */
export default function LegalPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-3xl px-5 py-12">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {LEGAL_AGREEMENT_TITLE}
        </h1>

        {LEGAL_AGREEMENT_INTRO.split("\n\n").map((paragraph) => (
          <p key={paragraph.slice(0, 32)} className="mt-4 text-ink-600">
            {paragraph}
          </p>
        ))}

        <div className="mt-10 flex flex-col gap-8">
          {LEGAL_AGREEMENT_SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-bold tracking-tight">{section.heading}</h2>
              <p className="mt-2 text-ink-600">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
