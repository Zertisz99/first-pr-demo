"use client";

import { useActionState } from "react";
import { addVideoCommentAction } from "@/lib/actions/videos";

export default function AddCommentForm({
  teamId,
  videoId,
}: {
  teamId: string;
  videoId: string;
}) {
  const [state, formAction, pending] = useActionState(addVideoCommentAction, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-start gap-2">
      <input type="hidden" name="teamId" value={teamId} />
      <input type="hidden" name="videoId" value={videoId} />
      <input
        name="timestampSeconds"
        type="number"
        min={0}
        placeholder="Sec"
        className="w-16 rounded-md border border-line bg-surface-raised px-2 py-1.5 font-body text-[12.5px] text-fg focus-visible:outline focus-visible:outline-2"
        style={{ outlineColor: "var(--color-accent)" }}
      />
      <input
        name="comment"
        type="text"
        required
        placeholder="Add a comment…"
        className="min-w-[180px] flex-1 rounded-md border border-line bg-surface-raised px-2.5 py-1.5 font-body text-[13px] text-fg focus-visible:outline focus-visible:outline-2"
        style={{ outlineColor: "var(--color-accent)" }}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-line-strong px-3 py-1.5 font-body text-[13px] font-semibold text-fg disabled:opacity-60"
      >
        {pending ? "Posting…" : "Post"}
      </button>
      {state?.error && (
        <span className="w-full font-body text-[12.5px]" style={{ color: "var(--color-bad)" }}>
          {state.error}
        </span>
      )}
    </form>
  );
}
