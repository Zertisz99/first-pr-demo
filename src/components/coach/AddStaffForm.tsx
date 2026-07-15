"use client";

import { useActionState } from "react";
import { addStaffAction } from "@/lib/actions/staff";
import { STAFF_ROLE_LABELS } from "@/lib/staff-constants";

const fieldClass =
  "rounded-md border border-line bg-surface-raised px-3 py-2 font-body text-sm text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2";

export default function AddStaffForm({ teamId }: { teamId: string }) {
  const [state, formAction, pending] = useActionState(addStaffAction, undefined);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-4"
    >
      <input type="hidden" name="teamId" value={teamId} />
      <h3 className="font-display uppercase tracking-wide text-[13px] text-fg-muted">
        Add staff member
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          name="name"
          type="text"
          required
          placeholder="Name"
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        />
        <select
          name="role"
          required
          defaultValue=""
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        >
          <option value="" disabled>
            Role
          </option>
          {Object.entries(STAFF_ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          name="email"
          type="email"
          placeholder="Email (optional)"
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
        {pending ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
