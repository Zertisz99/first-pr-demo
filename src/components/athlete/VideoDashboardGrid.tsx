"use client";

import { useMemo, useState } from "react";
import VideoCard from "@/components/athlete/VideoCard";
import type { AthleteVideoEntry } from "@/lib/videos";

type Filter = "all" | "highlights";

export default function VideoDashboardGrid({
  handle,
  videos,
}: {
  handle: string;
  videos: AthleteVideoEntry[];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () => (filter === "highlights" ? videos.filter((v) => v.isHighlight) : videos),
    [videos, filter]
  );

  if (videos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line-strong p-10 text-center">
        <p className="font-body text-sm text-fg-muted">
          No videos yet — upload one above.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className="rounded-full border px-3 py-1 font-body text-[12.5px] font-medium"
          style={
            filter === "all"
              ? {
                  background: "var(--color-accent)",
                  color: "var(--color-accent-fg)",
                  borderColor: "var(--color-accent)",
                }
              : { borderColor: "var(--color-line-strong)", color: "var(--color-fg-muted)" }
          }
        >
          All ({videos.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("highlights")}
          className="rounded-full border px-3 py-1 font-body text-[12.5px] font-medium"
          style={
            filter === "highlights"
              ? {
                  background: "var(--color-accent)",
                  color: "var(--color-accent-fg)",
                  borderColor: "var(--color-accent)",
                }
              : { borderColor: "var(--color-line-strong)", color: "var(--color-fg-muted)" }
          }
        >
          Highlights ({videos.filter((v) => v.isHighlight).length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="font-body text-sm text-fg-faint">No videos match this filter.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((video) => (
            <VideoCard key={video.id} handle={handle} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
