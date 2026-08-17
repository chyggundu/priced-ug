import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
}) {
  return (
    <Reveal className="max-w-2xl">
      <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-brand-500 uppercase">
        <span className="h-px w-6 bg-brand-500/50" />
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-ink-600">{body}</p>
    </Reveal>
  );
}
