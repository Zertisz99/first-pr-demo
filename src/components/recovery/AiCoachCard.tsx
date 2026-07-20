"use client";

import { useState } from "react";
import { getRecoveryCoachInsight } from "@/lib/actions/aiCoach";

export default function AiCoachCard({ athleteHandle }: { athleteHandle: string }) {
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await getRecoveryCoachInsight(athleteHandle);
    if ("error" in result) {
      setError(result.error);
    } else {
      setInsight(result.insight);
    }
    setLoading(false);
  }

  return (
    <div>
      <h2 className="mb-3 font-display uppercase tracking-wide text-[13px] text-fg-muted">
        AI recovery coach
      </h2>

      {insight ? (
        <div className="rounded-lg border border-line bg-surface-raised p-4">
          <p className="font-body text-sm leading-relaxed text-fg">{insight}</p>
          <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className="mt-3 font-body text-[12px] text-fg-faint underline disabled:opacity-50"
          >
            {loading ? "Thinking…" : "Ask again"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="rounded-md border border-line-strong px-3 py-1.5 font-body text-[12.5px] font-semibold text-fg disabled:opacity-50"
        >
          {loading ? "Thinking…" : "Get today's insight"}
        </button>
      )}

      {error && <p className="mt-2 font-body text-[12.5px] text-red-400">{error}</p>}
    </div>
  );
}
