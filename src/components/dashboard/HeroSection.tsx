import { getDailyQuote } from "@/lib/quotes";
import type { RecoverySnapshot } from "@/lib/dashboard";

function trainingStatus(recovery: RecoverySnapshot): { label: string; tone: "good" | "warn" | "neutral" } {
  if (!recovery) return { label: "Log today's recovery", tone: "neutral" };
  if (recovery.readinessScore >= 70) return { label: "Ready to train", tone: "good" };
  return { label: "Recovering", tone: "warn" };
}

export default function HeroSection({
  name,
  recovery,
}: {
  name: string;
  recovery: RecoverySnapshot;
}) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const firstName = name.split(" ")[0];
  const status = trainingStatus(recovery);
  const toneColor =
    status.tone === "good"
      ? "var(--color-good)"
      : status.tone === "warn"
        ? "var(--color-warning)"
        : "var(--color-fg-faint)";

  return (
    <div
      className="rounded-2xl border border-line p-6 sm:p-8"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--color-sport-live) 30%, var(--color-surface-sunken)) 0%, var(--color-surface-sunken) 70%)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg sm:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 font-body text-sm text-fg-muted">{today}</p>
        </div>
        <span
          className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-data text-[11px] font-semibold uppercase tracking-wide"
          style={{ borderColor: toneColor, color: toneColor }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: toneColor }} />
          {status.label}
        </span>
      </div>
      <p className="mt-4 max-w-[52ch] font-body text-[13.5px] italic text-fg-muted">
        &ldquo;{getDailyQuote()}&rdquo;
      </p>
    </div>
  );
}
