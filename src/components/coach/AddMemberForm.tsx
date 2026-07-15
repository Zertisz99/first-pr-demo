"use client";

import { useActionState } from "react";
import { addTeamMemberAction } from "@/lib/actions/team";

export default function AddMemberForm({
  teamId,
  candidates,
}: {
  teamId: string;
  candidates: { handle: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(addTeamMemberAction, undefined);

  if (candidates.length === 0) {
    return (
      <p className="font-body text-[12.5px] text-fg-faint">
        No other athletes available to add right now.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="teamId" value={teamId} />
      <select
        name="athleteHandle"
        required
        defaultValue=""
        className="rounded-md border border-line bg-surface-raised px-2.5 py-1.5 font-body text-[13px] text-fg focus-visible:outline focus-visible:outline-2"
        style={{ outlineColor: "var(--color-accent)" }}
      >
        <option value="" disabled>
          Add athlete…
        </option>
        {candidates.map((a) => (
          <option key={a.handle} value={a.handle}>
            {a.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-line-strong px-3 py-1.5 font-body text-[13px] font-semibold text-fg disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add"}
      </button>
      {state?.error && (
        <span className="font-body text-[12.5px]" style={{ color: "var(--color-bad)" }}>
          {state.error}
        </span>
      )}
    </form>
  );
}
