"use client";

import { useActionState } from "react";
import { inviteCoachAction } from "@/lib/actions/coachAssignments";

const fieldClass =
  "rounded-md border border-line bg-surface-raised px-2.5 py-1.5 font-body text-[13px] text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2";

export default function InviteCoachForm({ teamId }: { teamId: string }) {
  const [state, formAction, pending] = useActionState(inviteCoachAction, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="teamId" value={teamId} />
      <input
        name="email"
        type="email"
        required
        placeholder="Coach's email…"
        className={fieldClass}
        style={{ outlineColor: "var(--color-accent)" }}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-line-strong px-3 py-1.5 font-body text-[13px] font-semibold text-fg disabled:opacity-60"
      >
        {pending ? "Inviting…" : "Invite"}
      </button>
      {state?.error && (
        <span className="font-body text-[12.5px]" style={{ color: "var(--color-bad)" }}>
          {state.error}
        </span>
      )}
    </form>
  );
}
