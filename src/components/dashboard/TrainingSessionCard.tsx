import Link from "next/link";
import { CalendarClock } from "lucide-react";
import type { NextSession } from "@/lib/dashboard";

export default function TrainingSessionCard({
  handle,
  session,
  accent,
}: {
  handle: string;
  session: NextSession | null;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-6">
      <div className="mb-3 flex items-center gap-2">
        <CalendarClock size={18} color={accent} />
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-fg">
          Next Training Session
        </h2>
      </div>

      {session ? (
        <>
          <p className="font-body text-base font-semibold text-fg">{session.sessionType}</p>
          <p className="mt-1 font-body text-[13px] text-fg-muted">{session.title}</p>
          <dl className="mt-3 grid grid-cols-2 gap-y-1.5 font-body text-[12.5px] text-fg-muted">
            <dt className="text-fg-faint">Coach</dt>
            <dd className="text-right text-fg">{session.coachName}</dd>
            <dt className="text-fg-faint">Date</dt>
            <dd className="text-right text-fg">{session.date}</dd>
            <dt className="text-fg-faint">Duration</dt>
            <dd className="text-right text-fg">{session.durationMin} min</dd>
          </dl>
          <Link
            href={`/athletes/${handle}/training`}
            className="mt-4 inline-block rounded-md px-4 py-2 font-body text-sm font-semibold"
            style={{ background: accent, color: "#fff" }}
          >
            Open Training Plan
          </Link>
        </>
      ) : (
        <p className="font-body text-sm text-fg-faint">No upcoming sessions scheduled.</p>
      )}
    </div>
  );
}
