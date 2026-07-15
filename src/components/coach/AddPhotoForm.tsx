"use client";

import { useActionState } from "react";
import { addPhotoAction } from "@/lib/actions/gallery";

const fieldClass =
  "rounded-md border border-line bg-surface-raised px-3 py-2 font-body text-sm text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2";

export default function AddPhotoForm({ teamId }: { teamId: string }) {
  const [state, formAction, pending] = useActionState(addPhotoAction, undefined);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-4"
    >
      <input type="hidden" name="teamId" value={teamId} />
      <h3 className="font-display uppercase tracking-wide text-[13px] text-fg-muted">
        Add a photo
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          name="url"
          type="url"
          required
          placeholder="Photo URL"
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        />
        <input
          name="caption"
          type="text"
          placeholder="Caption (optional)"
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
        {pending ? "Adding…" : "Add photo"}
      </button>
    </form>
  );
}
