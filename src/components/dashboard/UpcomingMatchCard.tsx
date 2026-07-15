import Link from "next/link";
import { Trophy } from "lucide-react";
import Countdown from "@/components/dashboard/Countdown";
import type { NextMatch } from "@/lib/dashboard";

export default function UpcomingMatchCard({
  handle,
  match,
  accent,
}: {
  handle: string;
  match: NextMatch | null;
  accent: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-line p-6 sm:p-8"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 30%, var(--color-surface-sunken)) 0%, var(--color-surface-sunken) 75%)`,
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Trophy size={20} color={accent} />
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-fg">
          Upcoming Match
        </h2>
      </div>

      {match ? (
        <>
          <p className="font-display text-2xl font-bold uppercase tracking-wide text-fg sm:text-3xl">
            vs {match.opponent}
          </p>
          <p className="mt-1 font-body text-sm text-fg-muted">{match.teamName}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-body text-[13px] text-fg-muted">
            <span>
              {new Date(match.matchDate).toLocaleString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            {match.venue && <span>{match.venue}</span>}
          </div>

          <p className="mt-3 font-display text-xl font-bold text-fg">
            <Countdown targetIso={match.matchDate} />
          </p>

          <Link
            href={`/athletes/${handle}/matches`}
            className="mt-5 inline-block rounded-md px-4 py-2 font-body text-sm font-semibold"
            style={{ background: accent, color: "#fff" }}
          >
            View Match Details
          </Link>
        </>
      ) : (
        <p className="font-body text-sm text-fg-faint">No upcoming matches scheduled.</p>
      )}
    </div>
  );
}
