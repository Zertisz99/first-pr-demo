"use client";

import { useState, useActionState } from "react";
import {
  addToWatchlistAction,
  removeFromWatchlistAction,
  sendContactRequestAction,
} from "@/lib/actions/scouting";

export default function ScoutActions({
  athleteId,
  athleteHandle,
  alreadyWatchlisted,
  hasPendingRequest,
  athleteClaimed,
}: {
  athleteId: string;
  athleteHandle: string;
  alreadyWatchlisted: boolean;
  hasPendingRequest: boolean;
  athleteClaimed: boolean;
}) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [state, formAction, pending] = useActionState(
    sendContactRequestAction,
    undefined
  );

  return (
    <div className="flex flex-wrap items-start gap-3">
      <form action={alreadyWatchlisted ? removeFromWatchlistAction : addToWatchlistAction}>
        <input type="hidden" name="athleteId" value={athleteId} />
        <input type="hidden" name="athleteHandle" value={athleteHandle} />
        <button
          type="submit"
          className="rounded-md border border-line-strong px-5 py-2.5 font-body text-sm font-semibold text-fg"
        >
          {alreadyWatchlisted ? "Remove from watchlist" : "Watchlist"}
        </button>
      </form>

      {athleteClaimed &&
        (hasPendingRequest ? (
          <span className="flex items-center rounded-md px-5 py-2.5 font-body text-sm font-medium text-fg-muted">
            Request pending
          </span>
        ) : showContactForm ? (
          <form action={formAction} className="flex flex-col gap-2">
            <input type="hidden" name="athleteId" value={athleteId} />
            <textarea
              name="message"
              required
              rows={2}
              placeholder="Say why you're reaching out…"
              className="w-64 rounded-md border border-line bg-surface-raised px-3 py-2 font-body text-sm text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2"
              style={{ outlineColor: "var(--color-accent)" }}
            />
            {state?.error && (
              <p className="font-body text-[12.5px]" style={{ color: "var(--color-bad)" }}>
                {state.error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="self-start rounded-md px-4 py-2 font-body text-sm font-semibold disabled:opacity-60"
              style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}
            >
              {pending ? "Sending…" : "Send request"}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowContactForm(true)}
            className="rounded-md px-5 py-2.5 font-body text-sm font-semibold"
            style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}
          >
            Request contact
          </button>
        ))}
    </div>
  );
}
