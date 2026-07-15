"use client";

import { useActionState } from "react";
import { createTeamAction } from "@/lib/actions/team";
import { SPORT_KEYS, SPORT_LABELS } from "@/lib/sports";

const fieldClass =
  "rounded-md border border-line bg-surface-raised px-3 py-2 font-body text-sm text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2";

export default function CreateTeamForm() {
  const [state, formAction, pending] = useActionState(createTeamAction, undefined);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-4"
    >
      <h3 className="font-display uppercase tracking-wide text-[13px] text-fg-muted">
        Create a team
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          name="name"
          type="text"
          required
          placeholder="Team name"
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        />
        <select
          name="sport"
          required
          defaultValue=""
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        >
          <option value="" disabled>
            Sport
          </option>
          {SPORT_KEYS.map((key) => (
            <option key={key} value={key}>
              {SPORT_LABELS[key]}
            </option>
          ))}
        </select>
        <input
          name="ageGroup"
          type="text"
          placeholder="Age group (optional)"
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        />
      </div>
      {state?.error && (
        <p
          role="alert"
          className="font-body text-[13px]"
          style={{ color: "var(--color-bad)" }}
        >
          {state.error}
        </p>
      )}
      <button
        id="create-team-submit"
        type="submit"
        disabled={pending}
        className="self-start rounded-md px-4 py-2 font-body text-sm font-semibold disabled:opacity-60"
        style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}
      >
        {pending ? "Creating…" : "Create team"}
      </button>
    </form>
  );
}
