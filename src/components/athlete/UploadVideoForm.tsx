"use client";

import { useActionState } from "react";
import { uploadAthleteVideoAction } from "@/lib/actions/athlete-videos";

const fieldClass =
  "rounded-md border border-line bg-surface-raised px-3 py-2 font-body text-sm text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2";

export default function UploadVideoForm({ handle }: { handle: string }) {
  const [state, formAction, pending] = useActionState(uploadAthleteVideoAction, undefined);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-4"
    >
      <input type="hidden" name="handle" value={handle} />
      <h3 className="font-display uppercase tracking-wide text-[13px] text-fg-muted">
        Upload a video
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
        <input
          name="storageUrl"
          type="url"
          required
          placeholder="Video URL"
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        />
      </div>
      <textarea
        name="description"
        placeholder="Description (optional)"
        rows={2}
        className={fieldClass}
        style={{ outlineColor: "var(--color-accent)" }}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          name="visibility"
          defaultValue="private"
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        >
          <option value="private">Private (only me)</option>
          <option value="team_only">Team only</option>
          <option value="public">Public</option>
        </select>
        <input
          name="tags"
          type="text"
          placeholder="Tags, comma separated"
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
        type="submit"
        disabled={pending}
        className="self-start rounded-md px-4 py-2 font-body text-sm font-semibold disabled:opacity-60"
        style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}
      >
        {pending ? "Uploading…" : "Upload video"}
      </button>
    </form>
  );
}
