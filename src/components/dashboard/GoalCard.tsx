"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { updateGoalAction, deleteGoalAction } from "@/lib/actions/goals";
import type { AthleteGoal } from "@/lib/goals";

export default function GoalCard({
  handle,
  goal,
  accent,
}: {
  handle: string;
  goal: AthleteGoal;
  accent: string;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateGoalAction, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setEditing(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  if (editing) {
    return (
      <form
        action={formAction}
        className="flex flex-col gap-2 rounded-lg border border-line bg-surface-raised p-4"
      >
        <input type="hidden" name="handle" value={handle} />
        <input type="hidden" name="goalId" value={goal.id} />
        <input
          name="title"
          type="text"
          required
          defaultValue={goal.title}
          className="rounded-md border border-line bg-surface-sunken px-2.5 py-1.5 font-body text-[13px] text-fg"
        />
        <input
          name="progressPercent"
          type="number"
          min={0}
          max={100}
          defaultValue={goal.progressPercent}
          className="w-20 rounded-md border border-line bg-surface-sunken px-2.5 py-1.5 font-body text-[13px] text-fg"
        />
        {state?.error && (
          <p className="font-body text-[12px]" style={{ color: "var(--color-bad)" }}>
            {state.error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-line-strong px-3 py-1.5 font-body text-[12.5px] font-semibold text-fg disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="font-body text-[12.5px] text-fg-muted hover:text-fg"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-surface-raised p-4">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="font-body text-[13.5px] font-semibold text-fg">{goal.title}</p>
        <span className="font-data text-sm font-bold tabular-nums" style={{ color: accent }}>
          {goal.progressPercent}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
        <motion.div
          className="h-full rounded-full"
          style={{ background: accent }}
          initial={{ width: 0 }}
          animate={{ width: `${goal.progressPercent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="font-body text-[12px] font-medium text-fg-muted hover:text-fg"
        >
          Edit
        </button>
        <form action={deleteGoalAction}>
          <input type="hidden" name="handle" value={handle} />
          <input type="hidden" name="goalId" value={goal.id} />
          <button
            type="submit"
            className="font-body text-[12px] font-medium text-fg-muted hover:text-[var(--color-bad)]"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
