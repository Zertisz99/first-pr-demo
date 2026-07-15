import Link from "next/link";
import RecoveryRing from "@/components/dashboard/RecoveryRing";
import type { RecoverySnapshot } from "@/lib/dashboard";

export default function RecoveryCard({
  handle,
  recovery,
  accent,
}: {
  handle: string;
  recovery: RecoverySnapshot;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-fg">
          Recovery
        </h2>
        <Link
          href={`/athletes/${handle}/recovery`}
          className="rounded-md px-3.5 py-1.5 font-body text-[12.5px] font-semibold"
          style={{ background: accent, color: "#fff" }}
        >
          Complete Today&rsquo;s Recovery
        </Link>
      </div>

      {recovery ? (
        <div className="flex flex-wrap justify-between gap-4">
          <RecoveryRing
            label="Sleep"
            value={Math.min(100, (recovery.sleepHours / 10) * 100)}
            displayValue={`${recovery.sleepHours}h`}
            accent={accent}
          />
          <RecoveryRing
            label="Recovery"
            value={recovery.readinessScore}
            displayValue={`${recovery.readinessScore}`}
            accent={accent}
          />
          <RecoveryRing
            label="Soreness"
            value={recovery.soreness}
            displayValue={`${recovery.soreness}`}
            accent={accent}
          />
          <RecoveryRing
            label="Fatigue"
            value={recovery.fatigueScore}
            displayValue={`${recovery.fatigueScore}`}
            accent={accent}
          />
          <RecoveryRing
            label="Wellness"
            value={recovery.wellnessScore}
            displayValue={`${recovery.wellnessScore}`}
            accent={accent}
          />
        </div>
      ) : (
        <p className="font-body text-sm text-fg-faint">
          You haven&rsquo;t logged today&rsquo;s check-in yet.
        </p>
      )}
    </div>
  );
}
