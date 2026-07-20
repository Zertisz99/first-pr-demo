"use client";

import { useState, useActionState } from "react";
import { addAchievementCommentAction } from "@/lib/actions/achievementComments";
import type { AchievementCommentEntry } from "@/lib/achievementComments";

export default function AchievementCommentSection({
  achievementId,
  athleteHandle,
  comments,
  canComment,
}: {
  achievementId: string;
  athleteHandle: string;
  comments: AchievementCommentEntry[];
  canComment: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [state, formAction, pending] = useActionState(addAchievementCommentAction, undefined);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="font-data text-[10.5px] text-fg-faint hover:text-fg"
      >
        {comments.length === 0
          ? "Comment"
          : `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`}
      </button>

      {expanded && (
        <div className="mt-1.5 flex flex-col gap-1.5 rounded-md border border-line bg-surface-raised p-2">
          {comments.map((c) => (
            <p key={c.id} className="font-body text-[11px] leading-snug text-fg-muted">
              <span className="font-semibold text-fg">{c.userName}</span> {c.comment}
            </p>
          ))}

          {canComment && (
            <form action={formAction} className="mt-1 flex flex-col gap-1">
              <input type="hidden" name="achievementId" value={achievementId} />
              <input type="hidden" name="athleteHandle" value={athleteHandle} />
              <input
                name="comment"
                type="text"
                required
                placeholder="Add a comment…"
                className="rounded-md border border-line bg-surface px-2 py-1 font-body text-[11px] text-fg focus-visible:outline focus-visible:outline-2"
                style={{ outlineColor: "var(--color-accent)" }}
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="self-start rounded-md border border-line-strong px-2 py-1 font-body text-[10.5px] font-semibold text-fg disabled:opacity-60"
                >
                  {pending ? "Posting…" : "Post"}
                </button>
                {state?.error && (
                  <span className="font-body text-[10.5px]" style={{ color: "var(--color-bad)" }}>
                    {state.error}
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
