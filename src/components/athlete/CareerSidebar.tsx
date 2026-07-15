import type { Achievement, CareerStint } from "@/lib/athletes";

export default function CareerSidebar({
  career,
  achievements,
  accent,
}: {
  career: CareerStint[];
  achievements: Achievement[];
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="font-display uppercase tracking-wide text-[13px] text-fg-muted mb-3">
          Career history
        </h3>
        <ol className="flex flex-col gap-4">
          {career.map((c) => (
            <li key={c.club} className="relative pl-4">
              <span
                className="absolute left-0 top-1.5 h-2 w-2 rounded-full"
                style={{ background: accent }}
                aria-hidden
              />
              <p className="font-body text-sm font-semibold text-fg">{c.club}</p>
              <p className="font-data text-[11px] text-fg-faint">{c.period}</p>
              {c.note && (
                <p className="font-body text-[12.5px] text-fg-muted">{c.note}</p>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h3 className="font-display uppercase tracking-wide text-[13px] text-fg-muted mb-3">
          Achievements
        </h3>
        <ul className="flex flex-col gap-3">
          {achievements.map((a) => (
            <li key={a.title} className="flex items-start gap-2.5">
              <svg
                width="15"
                height="15"
                viewBox="0 0 20 20"
                fill="none"
                className="mt-0.5 shrink-0"
                aria-hidden
              >
                <path
                  d="M10 1.5 12.4 3.9 15.7 3.3 16.4 6.6 19 8.8 17.3 11.7 18 15 14.7 15.7 12.9 18.5 10 17 7.1 18.5 5.3 15.7 2 15 2.7 11.7 1 8.8 3.6 6.6 4.3 3.3 7.6 3.9Z"
                  fill={accent}
                />
              </svg>
              <div>
                <p className="font-body text-[13.5px] font-medium text-fg">{a.title}</p>
                <p className="font-data text-[11px] text-fg-faint">{a.period}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-line bg-surface-raised p-4">
        <p className="font-display uppercase tracking-wide text-[13px] text-fg mb-1.5">
          Scouting this athlete?
        </p>
        <p className="font-body text-[12.5px] text-fg-muted mb-3">
          Every view and contact request is logged and visible to the athlete — no silent
          scraping.
        </p>
        <button
          type="button"
          className="w-full rounded-md px-4 py-2.5 font-body text-sm font-semibold"
          style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}
        >
          Send contact request
        </button>
      </div>
    </div>
  );
}
