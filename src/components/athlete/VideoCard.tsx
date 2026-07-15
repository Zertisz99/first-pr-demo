"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  updateAthleteVideoAction,
  deleteAthleteVideoAction,
} from "@/lib/actions/athlete-videos";
import type { AthleteVideoEntry } from "@/lib/videos";

const fieldClass =
  "rounded-md border border-line bg-surface-raised px-2.5 py-1.5 font-body text-[13px] text-fg focus-visible:outline focus-visible:outline-2";

export default function VideoCard({
  handle,
  video,
}: {
  handle: string;
  video: AthleteVideoEntry;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateAthleteVideoAction, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setEditing(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface-raised p-4">
      <div
        className="relative flex aspect-video items-center justify-center overflow-hidden rounded-md"
        style={{
          background:
            "linear-gradient(155deg, color-mix(in srgb, var(--color-sport-live) 45%, var(--color-surface-sunken)) 0%, var(--color-surface-sunken) 100%)",
        }}
      >
        <a
          href={video.storageUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-full w-full items-center justify-center"
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.18)" />
            <path d="M9.5 7.5 17 12l-7.5 4.5Z" fill="#fff" />
          </svg>
        </a>
        {video.isHighlight && (
          <span
            className="absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 font-data text-[10px] uppercase tracking-wide"
            style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}
          >
            Highlight
          </span>
        )}
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/55 px-1.5 py-0.5 font-data text-[10px] uppercase tracking-wide text-white">
          {video.visibility.replace("_", " ")}
        </span>
      </div>

      {!editing ? (
        <>
          <p className="font-body text-sm font-semibold text-fg">{video.title}</p>
          {video.description && (
            <p className="font-body text-[12.5px] text-fg-muted">{video.description}</p>
          )}
          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {video.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line px-2 py-0.5 font-data text-[10px] uppercase tracking-wide text-fg-faint"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="font-body text-[12.5px] font-medium text-fg-muted hover:text-fg"
            >
              Edit
            </button>
            <form action={deleteAthleteVideoAction}>
              <input type="hidden" name="handle" value={handle} />
              <input type="hidden" name="videoId" value={video.id} />
              <button
                type="submit"
                className="font-body text-[12.5px] font-medium text-fg-muted hover:text-[var(--color-bad)]"
              >
                Delete
              </button>
            </form>
          </div>
        </>
      ) : (
        <form action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="handle" value={handle} />
          <input type="hidden" name="videoId" value={video.id} />
          <input
            name="title"
            type="text"
            required
            defaultValue={video.title}
            className={fieldClass}
            style={{ outlineColor: "var(--color-accent)" }}
          />
          <textarea
            name="description"
            rows={2}
            defaultValue={video.description ?? ""}
            placeholder="Description"
            className={fieldClass}
            style={{ outlineColor: "var(--color-accent)" }}
          />
          <input
            name="tags"
            type="text"
            defaultValue={video.tags.join(", ")}
            placeholder="Tags, comma separated"
            className={fieldClass}
            style={{ outlineColor: "var(--color-accent)" }}
          />
          <select
            name="visibility"
            defaultValue={video.visibility}
            className={fieldClass}
            style={{ outlineColor: "var(--color-accent)" }}
          >
            <option value="private">Private (only me)</option>
            <option value="team_only">Team only</option>
            <option value="public">Public</option>
          </select>
          <label className="flex items-center gap-2 font-body text-[12.5px] text-fg-muted">
            <input
              type="checkbox"
              name="isHighlight"
              defaultChecked={video.isHighlight}
              className="h-4 w-4"
            />
            Match highlight
          </label>
          {state?.error && (
            <p className="font-body text-[12.5px]" style={{ color: "var(--color-bad)" }}>
              {state.error}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md border border-line-strong px-3 py-1.5 font-body text-[12.5px] font-semibold text-fg disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="font-body text-[12.5px] text-fg-muted hover:text-fg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
