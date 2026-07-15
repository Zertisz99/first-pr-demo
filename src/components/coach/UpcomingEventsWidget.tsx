import Link from "next/link";
import type { CalendarEvent } from "@/lib/calendar";

export default function UpcomingEventsWidget({
  teamId,
  events,
  accent,
}: {
  teamId: string;
  events: CalendarEvent[];
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-fg">
          Upcoming
        </h2>
        <Link
          href={`/coach/teams/${teamId}/calendar`}
          className="font-body text-[12.5px] font-medium hover:underline"
          style={{ color: accent }}
        >
          Calendar →
        </Link>
      </div>
      {events.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {events.map((e, i) => (
            <li key={i} className="flex items-center justify-between gap-2">
              <span className="font-body text-[13px] text-fg">{e.label}</span>
              <span className="font-data text-[11px] text-fg-faint">{e.date}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-body text-[12.5px] text-fg-faint">Nothing scheduled yet.</p>
      )}
    </div>
  );
}
