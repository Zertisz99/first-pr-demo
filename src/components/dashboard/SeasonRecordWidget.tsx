import { ShieldHalf } from "lucide-react";
import type { SeasonRecord } from "@/lib/season";

export default function SeasonRecordWidget({
  record,
  accent,
}: {
  record: SeasonRecord | null;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-raised p-4">
      <div className="mb-2 flex items-center gap-2">
        <ShieldHalf size={16} color={accent} />
        <span className="font-data text-[11px] uppercase tracking-wide text-fg-faint">
          Season Record
        </span>
      </div>
      {record && record.played > 0 ? (
        <>
          <p className="font-display text-xl font-bold text-fg">
            {record.won}W {record.drawn}D {record.lost}L
          </p>
          <p className="font-data text-[11px] text-fg-faint">
            {record.played} played · {record.winPercent}% win rate
          </p>
        </>
      ) : (
        <p className="font-body text-[12.5px] text-fg-faint">No results recorded yet.</p>
      )}
    </div>
  );
}
