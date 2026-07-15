import type { CalendarEvent } from "@/lib/calendar";

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function MonthCalendar({
  year,
  month,
  events,
}: {
  year: number;
  month: number;
  events: CalendarEvent[];
}) {
  const eventsByDate = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const list = eventsByDate.get(e.date) ?? [];
    list.push(e);
    eventsByDate.set(e.date, list);
  }

  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const firstWeekday = (firstOfMonth.getUTCDay() + 6) % 7; // Monday = 0

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = toDateKey(new Date());

  return (
    <div className="rounded-lg border border-line bg-surface-raised p-4">
      <div className="mb-2 grid grid-cols-7 gap-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div
            key={d}
            className="text-center font-data text-[10px] uppercase tracking-wide text-fg-faint"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="min-h-[70px]" />;
          const dateKey = toDateKey(new Date(Date.UTC(year, month, day)));
          const dayEvents = eventsByDate.get(dateKey) ?? [];
          const isToday = dateKey === today;
          return (
            <div
              key={i}
              className="min-h-[70px] rounded-md border p-1"
              style={{
                borderColor: isToday ? "var(--color-accent)" : "var(--color-line)",
              }}
            >
              <p className="font-data text-[11px] text-fg-faint">{day}</p>
              <div className="mt-0.5 flex flex-col gap-0.5">
                {dayEvents.map((e, idx) => (
                  <span
                    key={idx}
                    className="truncate rounded px-1 py-0.5 font-body text-[9.5px] leading-tight"
                    style={{
                      background:
                        e.type === "match"
                          ? "color-mix(in srgb, var(--color-sport-live) 30%, transparent)"
                          : "color-mix(in srgb, var(--color-accent) 25%, transparent)",
                      color: "var(--color-fg)",
                    }}
                  >
                    {e.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
