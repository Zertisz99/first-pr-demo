"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import {
  markNotificationReadAction,
  replyToNotificationAction,
} from "@/lib/actions/notifications";
import type { NotificationEntry } from "@/lib/notifications";

export default function NotificationList({
  notifications,
}: {
  notifications: NotificationEntry[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {notifications.map((n) => (
        <NotificationRow
          key={n.id}
          notification={n}
          expanded={expandedId === n.id}
          onToggle={() => setExpandedId(expandedId === n.id ? null : n.id)}
        />
      ))}
    </div>
  );
}

function NotificationRow({
  notification: n,
  expanded,
  onToggle,
}: {
  notification: NotificationEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [state, formAction, pending] = useActionState(replyToNotificationAction, undefined);

  return (
    <div
      className="rounded-lg border border-line p-4"
      style={{
        background: n.read ? "var(--color-surface-raised)" : "var(--color-surface-sunken)",
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={expanded}
        className="flex w-full cursor-pointer items-start justify-between gap-3 text-left"
      >
        <div>
          {!n.read && (
            <span
              className="mb-1 inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--color-accent)" }}
            />
          )}
          <p className="font-body text-[13.5px] text-fg">{n.message}</p>
          <p className="mt-0.5 font-data text-[10.5px] text-fg-faint">{n.createdAt}</p>
        </div>
        {!n.read && (
          <form
            action={markNotificationReadAction}
            onClick={(e) => e.stopPropagation()}
          >
            <input type="hidden" name="notificationId" value={n.id} />
            <button
              type="submit"
              className="whitespace-nowrap font-body text-[12px] font-medium text-fg-muted hover:text-fg"
            >
              Mark read
            </button>
          </form>
        )}
      </div>

      {expanded && (
        <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3">
          {n.senderName && (
            <p className="font-data text-[11px] uppercase tracking-wide text-fg-faint">
              From {n.senderName}
            </p>
          )}
          {n.link && (
            <Link
              href={n.link}
              className="self-start font-body text-[13px] font-medium hover:underline"
              style={{ color: "var(--color-accent)" }}
            >
              View →
            </Link>
          )}
          {n.senderId && (
            <form action={formAction} className="flex flex-col gap-2">
              <input type="hidden" name="notificationId" value={n.id} />
              <textarea
                name="message"
                required
                rows={2}
                placeholder="Write a reply…"
                className="rounded-md border border-line bg-surface-raised px-3 py-2 font-body text-sm text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2"
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
                {pending ? "Sending…" : "Reply"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
