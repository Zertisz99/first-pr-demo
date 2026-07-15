import { Users } from "lucide-react";

export type RosterMember = {
  name: string;
  position: string;
  status: "pending" | "active";
};

export default function RosterSummaryWidget({
  roster,
  accent,
}: {
  roster: RosterMember[];
  accent: string;
}) {
  const active = roster.filter((r) => r.status === "active");
  const pending = roster.length - active.length;

  return (
    <div className="rounded-xl border border-line bg-surface-raised p-4">
      <div className="mb-2 flex items-center gap-2">
        <Users size={16} color={accent} />
        <span className="font-data text-[11px] uppercase tracking-wide text-fg-faint">
          Roster
        </span>
      </div>
      <p className="mb-2 font-display text-xl font-bold text-fg">
        {active.length} {active.length === 1 ? "athlete" : "athletes"}
        {pending > 0 && (
          <span className="ml-2 font-body text-[12px] font-normal text-fg-faint">
            {pending} pending
          </span>
        )}
      </p>
      <ul className="flex flex-col gap-1">
        {active.map((r) => (
          <li key={r.name} className="flex items-center justify-between font-body text-[12.5px]">
            <span className="text-fg">{r.name}</span>
            <span className="text-fg-faint">{r.position}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
