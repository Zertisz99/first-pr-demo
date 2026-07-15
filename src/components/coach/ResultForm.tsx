"use client";

import { useActionState } from "react";
import { setResultAction } from "@/lib/actions/matches";
import type { MatchOutcome } from "@/generated/prisma/client";

export default function ResultForm({
  teamId,
  matchId,
  result,
  outcome,
}: {
  teamId: string;
  matchId: string;
  result: string | null;
  outcome: MatchOutcome | null;
}) {
  const [state, formAction, pending] = useActionState(setResultAction, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="teamId" value={teamId} />
      <input type="hidden" name="matchId" value={matchId} />
      <label className="font-data text-[10px] uppercase tracking-wide text-fg-faint">
        Result
      </label>
      <input
        name="result"
        type="text"
        defaultValue={result ?? ""}
        placeholder="e.g. 3-1"
        className="w-20 rounded-md border border-line bg-surface-raised px-2 py-1 font-body text-[12.5px] text-fg focus-visible:outline focus-visible:outline-2"
        style={{ outlineColor: "var(--color-accent)" }}
      />
      <select
        name="outcome"
        defaultValue={outcome ?? ""}
        className="rounded-md border border-line bg-surface-raised px-2 py-1 font-body text-[12.5px] text-fg focus-visible:outline focus-visible:outline-2"
        style={{ outlineColor: "var(--color-accent)" }}
      >
        <option value="">Not played yet</option>
        <option value="win">Win</option>
        <option value="draw">Draw</option>
        <option value="loss">Loss</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-line-strong px-2.5 py-1 font-body text-[12px] font-semibold text-fg disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {state?.error && (
        <span className="font-body text-[12px]" style={{ color: "var(--color-bad)" }}>
          {state.error}
        </span>
      )}
    </form>
  );
}
