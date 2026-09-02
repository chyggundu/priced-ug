import Image from "next/image";
import { team, type TeamMember } from "@/content/site";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { LinkedInIcon } from "./icons";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function Avatar({ member }: { member: TeamMember }) {
  if (member.photo) {
    return (
      <Image
        src={member.photo}
        alt={`Portrait of ${member.name}`}
        width={512}
        height={512}
        className="size-24 shrink-0 rounded-2xl object-cover ring-1 ring-black/5"
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-2xl font-extrabold text-white"
    >
      {initials(member.name)}
    </span>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <article className="group h-full rounded-2xl border border-line bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/10 sm:p-8">
      <div className="flex items-start gap-5">
        <Avatar member={member} />

        <div className="min-w-0">
          <h3 className="text-xl font-bold tracking-tight">{member.name}</h3>
          <p className="mt-0.5 text-sm font-semibold text-brand-500">{member.role}</p>
          {member.credentials && (
            <p className="mt-1 text-xs text-ink-400">{member.credentials}</p>
          )}
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-ink-600 transition hover:text-brand-500"
            >
              <LinkedInIcon className="size-3.5" />
              LinkedIn
            </a>
          )}
        </div>
      </div>

      <p className="mt-6 text-base leading-relaxed font-medium text-balance">
        {member.lead}
      </p>

      <div className="mt-4 space-y-4">
        {member.bio.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-ink-600">
            {paragraph}
          </p>
        ))}
      </div>

      {member.education && member.education.length > 0 && (
        <div className="mt-6 border-t border-line pt-5">
          <h4 className="text-xs font-semibold tracking-wide uppercase text-ink-400">
            Education
          </h4>
          <ul className="mt-3 space-y-2">
            {member.education.map((entry) => (
              <li key={entry.school} className="text-sm">
                <span className="font-semibold">{entry.school}</span>
                <span className="text-ink-600"> — {entry.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {member.skills && member.skills.length > 0 && (
        <div className="mt-6 border-t border-line pt-5">
          <h4 className="text-xs font-semibold tracking-wide uppercase text-ink-400">
            Skills
          </h4>
          <ul className="mt-3 flex flex-wrap gap-2">
            {member.skills.map((skill) => (
              <li
                key={skill}
                className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 ring-1 ring-brand-100"
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export function Team() {
  return (
    <section
      id="team"
      className="scroll-mt-20 bg-brand-50 bg-[radial-gradient(38rem_26rem_at_15%_0%,var(--color-brand-100),transparent_70%)] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Leadership"
          title="The people behind Priced Ug"
          body="Priced Ug is built by people who know logistics, operations and the Ugandan market first-hand."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {team.map((member, i) => (
            <Reveal key={member.name} delay={i * 100} className="h-full">
              <MemberCard member={member} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
