"use client";

import { useActionState } from "react";
import { setFormationAction } from "@/lib/actions/matches";

export default function FormationForm({
  teamId,
  matchId,
  formation,
}: {
  teamId: string;
  matchId: string;
  formation: string | null;
}) {
  const [state, formAction, pending] = useActionState(setFormationAction, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="teamId" value={teamId} />
      <input type="hidden" name="matchId" value={matchId} />
      <label className="font-data text-[10px] uppercase tracking-wide text-fg-faint">
        Formation
      </label>
      <input
        name="formation"
        type="text"
        defaultValue={formation ?? ""}
        placeholder="e.g. 4-3-3"
        className="w-28 rounded-md border border-line bg-surface-raised px-2 py-1 font-body text-[12.5px] text-fg focus-visible:outline focus-visible:outline-2"
        style={{ outlineColor: "var(--color-accent)" }}
      />
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
