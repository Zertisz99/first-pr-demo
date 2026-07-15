"use client";

import { useActionState } from "react";
import { setLineupRoleAction } from "@/lib/actions/matches";
import type { LineupRole } from "@/generated/prisma/client";

export default function LineupRow({
  teamId,
  matchId,
  athleteId,
  athleteName,
  defaultPosition,
  role,
  position,
  starterLabel,
  benchLabel,
}: {
  teamId: string;
  matchId: string;
  athleteId: string;
  athleteName: string;
  defaultPosition: string;
  role: LineupRole | "none";
  position: string | null;
  starterLabel: string;
  benchLabel: string;
}) {
  const [state, formAction, pending] = useActionState(setLineupRoleAction, undefined);

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-center gap-2 rounded-md border border-line px-3 py-2"
    >
      <input type="hidden" name="teamId" value={teamId} />
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="athleteId" value={athleteId} />
      <span className="min-w-[140px] font-body text-sm font-semibold text-fg">
        {athleteName}
      </span>
      <select
        name="role"
        defaultValue={role}
        className="rounded-md border border-line bg-surface-raised px-2 py-1 font-body text-[12.5px] text-fg focus-visible:outline focus-visible:outline-2"
        style={{ outlineColor: "var(--color-accent)" }}
      >
        <option value="none">Not selected</option>
        <option value="starter">{starterLabel}</option>
        <option value="bench">{benchLabel}</option>
      </select>
      <input
        name="position"
        type="text"
        defaultValue={position ?? defaultPosition}
        placeholder="Position"
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
