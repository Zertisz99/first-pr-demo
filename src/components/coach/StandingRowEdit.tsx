"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { updateStandingRowAction, deleteStandingRowAction } from "@/lib/actions/standings";
import type { StandingRow } from "@/lib/standings";

const fieldClass =
  "rounded-md border border-line bg-surface-sunken px-2 py-1 font-body text-[12.5px] text-fg";

export default function StandingRowEdit({
  teamId,
  row,
}: {
  teamId: string;
  row: StandingRow;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateStandingRowAction, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setEditing(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  if (editing) {
    return (
      <tr className="border-b border-line">
        <td colSpan={7} className="px-4 py-3">
          <form action={formAction} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="teamId" value={teamId} />
            <input type="hidden" name="rowId" value={row.id} />
            <input
              name="teamName"
              type="text"
              required
              defaultValue={row.teamName}
              className={`${fieldClass} min-w-[140px] flex-1`}
            />
            <input name="played" type="number" min={0} defaultValue={row.played} className={`${fieldClass} w-16`} />
            <input name="won" type="number" min={0} defaultValue={row.won} className={`${fieldClass} w-16`} />
            <input name="drawn" type="number" min={0} defaultValue={row.drawn} className={`${fieldClass} w-16`} />
            <input name="lost" type="number" min={0} defaultValue={row.lost} className={`${fieldClass} w-16`} />
            <input name="points" type="number" min={0} defaultValue={row.points} className={`${fieldClass} w-16`} />
            <button
              type="submit"
              disabled={pending}
              className="rounded-md border border-line-strong px-2.5 py-1 font-body text-[12px] font-semibold text-fg disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="font-body text-[12px] text-fg-muted hover:text-fg"
            >
              Cancel
            </button>
            {state?.error && (
              <span className="w-full font-body text-[12px]" style={{ color: "var(--color-bad)" }}>
                {state.error}
              </span>
            )}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-line">
      <td className="px-4 py-2 font-body text-[13px] text-fg">{row.teamName}</td>
      <td className="px-4 py-2 text-right font-data text-[13px] tabular-nums text-fg-muted">{row.played}</td>
      <td className="px-4 py-2 text-right font-data text-[13px] tabular-nums text-fg-muted">{row.won}</td>
      <td className="px-4 py-2 text-right font-data text-[13px] tabular-nums text-fg-muted">{row.drawn}</td>
      <td className="px-4 py-2 text-right font-data text-[13px] tabular-nums text-fg-muted">{row.lost}</td>
      <td className="px-4 py-2 text-right font-data text-sm font-semibold tabular-nums text-fg">{row.points}</td>
      <td className="px-4 py-2 text-right">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mr-3 font-body text-[12px] font-medium text-fg-muted hover:text-fg"
        >
          Edit
        </button>
        <form action={deleteStandingRowAction} className="inline">
          <input type="hidden" name="teamId" value={teamId} />
          <input type="hidden" name="rowId" value={row.id} />
          <button
            type="submit"
            className="font-body text-[12px] font-medium text-fg-muted hover:text-[var(--color-bad)]"
          >
            Delete
          </button>
        </form>
      </td>
    </tr>
  );
}
