"use client";

import { useActionState } from "react";
import { createGoalAction } from "@/lib/actions/goals";

export default function AddGoalForm({ handle }: { handle: string }) {
  const [state, formAction, pending] = useActionState(createGoalAction, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="handle" value={handle} />
      <input
        name="title"
        type="text"
        required
        placeholder="New goal (e.g. Improve sprint speed)"
        className="min-w-[200px] flex-1 rounded-md border border-line bg-surface-raised px-2.5 py-1.5 font-body text-[13px] text-fg focus-visible:outline focus-visible:outline-2"
        style={{ outlineColor: "var(--color-accent)" }}
      />
      <input
        name="progressPercent"
        type="number"
        min={0}
        max={100}
        defaultValue={0}
        className="w-16 rounded-md border border-line bg-surface-raised px-2 py-1.5 font-body text-[13px] text-fg focus-visible:outline focus-visible:outline-2"
        style={{ outlineColor: "var(--color-accent)" }}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-line-strong px-3 py-1.5 font-body text-[12.5px] font-semibold text-fg disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add goal"}
      </button>
      {state?.error && (
        <span className="w-full font-body text-[12px]" style={{ color: "var(--color-bad)" }}>
          {state.error}
        </span>
      )}
    </form>
  );
}
