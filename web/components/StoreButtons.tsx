import { links } from "@/content/site";
import { AppleIcon, GooglePlayIcon } from "./icons";

/** Which background the buttons sit on. */
type Surface = "light" | "dark";

const BASE =
  "inline-flex items-center gap-3 rounded-xl px-5 py-3 transition focus-visible:outline-2 focus-visible:outline-offset-2";

const ACTIVE: Record<Surface, string> = {
  light: "bg-ink-900 text-white hover:bg-black focus-visible:outline-ink-900",
  dark: "bg-white text-ink-900 hover:bg-brand-50 focus-visible:outline-white",
};

const INERT: Record<Surface, string> = {
  light: "bg-ink-900/5 text-ink-400 ring-1 ring-line",
  dark: "bg-white/10 text-white/60 ring-1 ring-white/25",
};

function StoreButton({
  href,
  icon,
  kicker,
  label,
  surface,
}: {
  href: string;
  icon: React.ReactNode;
  kicker: string;
  label: string;
  surface: Surface;
}) {
  const content = (
    <>
      <span className="shrink-0 [&>svg]:size-6">{icon}</span>
      <span className="text-left">
        <span className="block text-[10px] leading-tight uppercase opacity-70">
          {kicker}
        </span>
        <span className="block text-sm leading-tight font-semibold">
          {href ? label : "Coming soon"}
        </span>
      </span>
    </>
  );

  // No URL configured yet — render an inert chip rather than a link to nowhere.
  if (!href) {
    return (
      <span className={`${BASE} ${INERT[surface]} cursor-default`} aria-disabled="true">
        {content}
      </span>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={`${BASE} ${ACTIVE[surface]}`}>
      {content}
    </a>
  );
}

export function StoreButtons({ surface = "light" }: { surface?: Surface }) {
  return (
    <div className="flex flex-wrap gap-3">
      <StoreButton
        href={links.appStore}
        icon={<AppleIcon />}
        kicker="Download on the"
        label="App Store"
        surface={surface}
      />
      <StoreButton
        href={links.playStore}
        icon={<GooglePlayIcon />}
        kicker="Get it on"
        label="Google Play"
        surface={surface}
      />
    </div>
  );
}
