import Link from "next/link";
import type { Athlete } from "@/lib/athletes";
import { SPORT_LABELS, SPORT_LIVE_ACCENT } from "@/lib/sports";

export default function AthleteCard({ athlete }: { athlete: Athlete }) {
  const headline = athlete.headlineStats[0];

  return (
    <Link
      href={`/athletes/${athlete.handle}`}
      data-sport={athlete.sport}
      className="group block overflow-hidden rounded-xl border border-line bg-surface-raised transition-colors hover:border-line-strong"
    >
      <div
        className="relative flex h-24 items-end p-4"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, ${SPORT_LIVE_ACCENT} 40%, var(--color-surface-sunken)) 0%, var(--color-surface-sunken) 75%)`,
        }}
      >
        <span
          className="font-data text-[10.5px] font-semibold uppercase tracking-wider rounded px-2 py-0.5"
          style={{ background: SPORT_LIVE_ACCENT, color: "#fff" }}
        >
          {SPORT_LABELS[athlete.sport]}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1.5">
          <h3 className="font-display text-lg font-bold uppercase tracking-wide text-fg">
            {athlete.name}
          </h3>
          {athlete.verified && (
            <svg
              width="13"
              height="13"
              viewBox="0 0 20 20"
              fill="none"
              aria-label="Verified"
            >
              <path
                d="M10 1.5 12.4 3.9 15.7 3.3 16.4 6.6 19 8.8 17.3 11.7 18 15 14.7 15.7 12.9 18.5 10 17 7.1 18.5 5.3 15.7 2 15 2.7 11.7 1 8.8 3.6 6.6 4.3 3.3 7.6 3.9Z"
                fill={SPORT_LIVE_ACCENT}
              />
              <path
                d="M6.5 10.2 8.8 12.5 13.5 7.5"
                stroke="#fff"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <p className="font-body text-[12.5px] text-fg-muted">
          {athlete.position} &middot; {athlete.nationality}
        </p>
        <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
          {headline ? (
            <>
              <span className="font-data text-[10.5px] uppercase tracking-wide text-fg-faint">
                {headline.label}
              </span>
              <span className="font-data text-base font-semibold tabular-nums text-fg">
                {headline.value}
              </span>
            </>
          ) : (
            <span className="font-data text-[10.5px] uppercase tracking-wide text-fg-faint">
              No stats logged yet
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
