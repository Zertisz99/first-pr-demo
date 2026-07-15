import { Flame } from "lucide-react";

export default function RecoveryStreakWidget({
  streak,
  accent,
}: {
  streak: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-raised p-4">
      <div className="flex items-center gap-2">
        <Flame size={18} color={accent} />
        <span className="font-data text-[11px] uppercase tracking-wide text-fg-faint">
          Recovery Streak
        </span>
      </div>
      <p className="mt-1 font-display text-2xl font-bold text-fg">
        {streak} {streak === 1 ? "day" : "days"}
      </p>
    </div>
  );
}
