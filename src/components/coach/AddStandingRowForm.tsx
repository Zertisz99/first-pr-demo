"use client";

import { useActionState } from "react";
import { addStandingRowAction } from "@/lib/actions/standings";

const fieldClass =
  "rounded-md border border-line bg-surface-raised px-2.5 py-1.5 font-body text-[13px] text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2";

export default function AddStandingRowForm({ teamId }: { teamId: string }) {
  const [state, formAction, pending] = useActionState(addStandingRowAction, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="teamId" value={teamId} />
      <input
        name="teamName"
        type="text"
        required
        placeholder="Team name"
        className={`${fieldClass} min-w-[160px] flex-1`}
        style={{ outlineColor: "var(--color-accent)" }}
      />
      {["played", "won", "drawn", "lost", "points"].map((field) => (
        <div key={field} className="flex flex-col gap-1">
          <label className="font-data text-[9.5px] uppercase tracking-wide text-fg-faint">
            {field}
          </label>
          <input
            name={field}
            type="number"
            min={0}
            defaultValue={0}
            className={`${fieldClass} w-16`}
            style={{ outlineColor: "var(--color-accent)" }}
          />
        </div>
      ))}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-line-strong px-3 py-1.5 font-body text-[12.5px] font-semibold text-fg disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add row"}
      </button>
      {state?.error && (
        <span className="w-full font-body text-[12px]" style={{ color: "var(--color-bad)" }}>
          {state.error}
        </span>
      )}
    </form>
  );
}
