import Link from "next/link";
import type { InjuryEntry } from "@/lib/injuries";

const STATUS_COLORS: Record<string, string> = {
  active: "var(--color-bad)",
  recovering: "var(--color-warning)",
  cleared: "var(--color-good)",
};

export default function InjuryAlertsWidget({
  teamId,
  injuries,
  accent,
}: {
  teamId: string;
  injuries: InjuryEntry[];
  accent: string;
}) {
  const ongoing = injuries.filter((i) => i.status !== "cleared");

  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-fg">
          Injury Report
        </h2>
        <Link
          href={`/coach/teams/${teamId}/injuries`}
          className="font-body text-[12.5px] font-medium hover:underline"
          style={{ color: accent }}
        >
          View all →
        </Link>
      </div>
      {ongoing.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {ongoing.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-2">
              <div>
                <p className="font-body text-[13px] font-semibold text-fg">{i.athleteName}</p>
                <p className="font-body text-[12px] text-fg-muted">{i.injuryType}</p>
              </div>
              <span
                className="rounded-full px-2 py-0.5 font-data text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  color: STATUS_COLORS[i.status],
                  border: `1px solid ${STATUS_COLORS[i.status]}`,
                }}
              >
                {i.status}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-body text-[12.5px] text-fg-faint">No active injuries.</p>
      )}
    </div>
  );
}
