"use client";

import { useActionState } from "react";
import { addTrainingSessionAction } from "@/lib/actions/training";
import { SESSION_TYPES, INTENSITY_LABELS } from "@/lib/training-constants";

const fieldClass =
  "rounded-md border border-line bg-surface-raised px-2.5 py-1.5 font-body text-[13px] text-fg focus-visible:outline focus-visible:outline-2";

export default function AddTrainingSessionForm({
  teamId,
  planId,
}: {
  teamId: string;
  planId: string;
}) {
  const [state, formAction, pending] = useActionState(addTrainingSessionAction, undefined);

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-2 rounded-md border border-dashed border-line-strong p-3"
    >
      <input type="hidden" name="teamId" value={teamId} />
      <input type="hidden" name="planId" value={planId} />
      <div className="flex flex-col gap-1">
        <label className="font-data text-[10px] uppercase tracking-wide text-fg-faint">
          Date
        </label>
        <input
          name="sessionDate"
          type="date"
          required
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-data text-[10px] uppercase tracking-wide text-fg-faint">
          Type
        </label>
        <select
          name="sessionType"
          required
          defaultValue=""
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        >
          <option value="" disabled>
            Type
          </option>
          {SESSION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-data text-[10px] uppercase tracking-wide text-fg-faint">
          Intensity
        </label>
        <select
          name="intensityLabel"
          required
          defaultValue=""
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        >
          <option value="" disabled>
            Intensity
          </option>
          {INTENSITY_LABELS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-data text-[10px] uppercase tracking-wide text-fg-faint">
          Duration (min)
        </label>
        <input
          name="durationMin"
          type="number"
          min={1}
          required
          placeholder="60"
          className={`${fieldClass} w-20`}
          style={{ outlineColor: "var(--color-accent)" }}
        />
      </div>
      <div className="flex min-w-[160px] flex-1 flex-col gap-1">
        <label className="font-data text-[10px] uppercase tracking-wide text-fg-faint">
          Notes (optional)
        </label>
        <input
          name="notes"
          type="text"
          placeholder="Focus, drills, etc."
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-line-strong px-3 py-1.5 font-body text-[13px] font-semibold text-fg disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add session"}
      </button>
      {state?.error && (
        <span className="font-body text-[12.5px]" style={{ color: "var(--color-bad)" }}>
          {state.error}
        </span>
      )}
    </form>
  );
}
