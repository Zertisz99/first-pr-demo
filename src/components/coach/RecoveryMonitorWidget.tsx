import Link from "next/link";
import type { AthleteRecoveryStatus } from "@/lib/team-recovery";

function readinessColor(score: number | null): string {
  if (score === null) return "var(--color-fg-faint)";
  if (score >= 70) return "var(--color-good)";
  if (score >= 50) return "var(--color-warning)";
  return "var(--color-bad)";
}

export default function RecoveryMonitorWidget({
  teamId,
  statuses,
  accent,
}: {
  teamId: string;
  statuses: AthleteRecoveryStatus[];
  accent: string;
}) {
  const loggedCount = statuses.filter((s) => s.loggedToday).length;
  const flagged = statuses.filter((s) => !s.loggedToday || (s.readinessScore ?? 100) < 50);

  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-fg">
          Recovery Monitoring
        </h2>
        <Link
          href={`/coach/teams/${teamId}/recovery`}
          className="font-body text-[12.5px] font-medium hover:underline"
          style={{ color: accent }}
        >
          View all →
        </Link>
      </div>
      <p className="mb-3 font-body text-sm text-fg-muted">
        {loggedCount}/{statuses.length} logged today
      </p>
      {flagged.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {flagged.map((s) => (
            <li
              key={s.athleteId}
              className="flex items-center justify-between font-body text-[13px] text-fg"
            >
              <span>{s.athleteName}</span>
              {s.loggedToday ? (
                <span
                  className="font-data text-[12px] font-semibold tabular-nums"
                  style={{ color: readinessColor(s.readinessScore) }}
                >
                  {s.readinessScore}
                </span>
              ) : (
                <span className="font-data text-[11px] uppercase tracking-wide text-fg-faint">
                  Not logged
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-body text-[12.5px] text-fg-faint">Everyone&rsquo;s on track.</p>
      )}
    </div>
  );
}
