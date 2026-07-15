"use client";

import { useActionState } from "react";
import { createInjuryAction } from "@/lib/actions/injuries";

const fieldClass =
  "rounded-md border border-line bg-surface-raised px-3 py-2 font-body text-sm text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2";

export default function CreateInjuryForm({
  teamId,
  roster,
}: {
  teamId: string;
  roster: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createInjuryAction, undefined);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-4"
    >
      <input type="hidden" name="teamId" value={teamId} />
      <h3 className="font-display uppercase tracking-wide text-[13px] text-fg-muted">
        Log an injury
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select
          name="athleteId"
          required
          defaultValue=""
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        >
          <option value="" disabled>
            Athlete
          </option>
          {roster.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <input
          name="injuryType"
          type="text"
          required
          placeholder="Injury (e.g. hamstring strain)"
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        />
        <input
          name="reportedDate"
          type="date"
          required
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="font-data text-[10px] uppercase tracking-wide text-fg-faint">
            Expected return (optional)
          </label>
          <input
            name="expectedReturnDate"
            type="date"
            className={fieldClass}
            style={{ outlineColor: "var(--color-accent)" }}
          />
        </div>
        <input
          name="notes"
          type="text"
          placeholder="Notes (optional)"
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        />
      </div>
      {state?.error && (
        <p role="alert" className="font-body text-[13px]" style={{ color: "var(--color-bad)" }}>
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md px-4 py-2 font-body text-sm font-semibold disabled:opacity-60"
        style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}
      >
        {pending ? "Saving…" : "Log injury"}
      </button>
    </form>
  );
}
