"use client";

import { useState, useTransition } from "react";
import { shareVideoAction } from "@/lib/actions/videoShares";

export default function ShareButton({
  videoId,
  url,
  initialCount,
}: {
  videoId: string;
  url: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleShare() {
    setError(null);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    startTransition(async () => {
      const result = await shareVideoAction(videoId);
      if ("error" in result) setError(result.error);
      else setCount(result.count);
    });
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        disabled={pending}
        className="rounded-md border border-line-strong px-2.5 py-1 font-body text-[11.5px] font-semibold text-fg disabled:opacity-60"
      >
        {copied ? "Link copied!" : "Share"}
      </button>
      {count > 0 && (
        <span className="font-data text-[11px] tabular-nums text-fg-faint">
          {count} {count === 1 ? "share" : "shares"}
        </span>
      )}
      {error && (
        <span className="font-body text-[11px]" style={{ color: "var(--color-bad)" }}>
          {error}
        </span>
      )}
    </div>
  );
}
