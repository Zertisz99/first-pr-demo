import type { PublicHighlight } from "@/lib/videos";
import ShareButton from "@/components/athlete/ShareButton";
import VideoThumbnail from "@/components/ui/VideoThumbnail";

export default function MatchHighlights({
  videos,
  accent,
  accentSecondary,
  shareCounts = {},
}: {
  videos: PublicHighlight[];
  accent: string;
  accentSecondary?: string;
  shareCounts?: Record<string, number>;
}) {
  return (
    <div>
      <h3 className="mb-3 font-display uppercase tracking-wide text-[15px] text-fg">
        Match Highlights
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {videos.map((v) => (
          <div key={v.id} className="rounded-lg border border-line bg-surface-raised p-3">
            <VideoThumbnail
              url={v.storageUrl}
              title={v.title}
              accent={accent}
              accentSecondary={accentSecondary}
            />
            <p className="mt-2 font-body text-[13px] font-semibold text-fg">{v.title}</p>
            {v.description && (
              <p className="mt-0.5 line-clamp-2 font-body text-[12px] text-fg-muted">
                {v.description}
              </p>
            )}
            {v.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {v.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-line px-1.5 py-0.5 font-data text-[9.5px] uppercase tracking-wide text-fg-faint"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <ShareButton
              videoId={v.id}
              url={v.storageUrl}
              initialCount={shareCounts[v.id] ?? 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
