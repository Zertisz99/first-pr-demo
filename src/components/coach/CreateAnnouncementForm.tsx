"use client";

import { useActionState } from "react";
import { createAnnouncementAction } from "@/lib/actions/announcements";

const fieldClass =
  "rounded-md border border-line bg-surface-raised px-3 py-2 font-body text-sm text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2";

export default function CreateAnnouncementForm({ teamId }: { teamId: string }) {
  const [state, formAction, pending] = useActionState(createAnnouncementAction, undefined);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-4"
    >
      <input type="hidden" name="teamId" value={teamId} />
      <h3 className="font-display uppercase tracking-wide text-[13px] text-fg-muted">
        Post to team
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          name="title"
          type="text"
          required
          placeholder="Title"
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        />
        <select
          name="category"
          defaultValue="general"
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        >
          <option value="general">General</option>
          <option value="training_change">Training change</option>
          <option value="match_update">Match update</option>
          <option value="event">Event</option>
        </select>
      </div>
      <textarea
        name="body"
        required
        rows={3}
        placeholder="What's the update?"
        className={fieldClass}
        style={{ outlineColor: "var(--color-accent)" }}
      />
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
        {pending ? "Posting…" : "Post"}
      </button>
    </form>
  );
}
