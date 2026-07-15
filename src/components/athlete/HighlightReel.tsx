import type { HighlightVideo } from "@/lib/athletes";

const SOURCE_LABEL: Record<HighlightVideo["source"], string> = {
  upload: "Uploaded",
  wyscout: "Wyscout",
  instat: "InStat",
};

export default function HighlightReel({
  videos,
  accent,
}: {
  videos: HighlightVideo[];
  accent: string;
}) {
  return (
    <div>
      <h3 className="font-display uppercase tracking-wide text-[15px] text-fg mb-3">
        Highlights
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {videos.map((v) => (
          <div key={v.title} className="group">
            <div
              className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg"
              style={{
                background: `linear-gradient(155deg, color-mix(in srgb, ${accent} 45%, var(--color-surface-sunken)) 0%, var(--color-surface-sunken) 100%)`,
              }}
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                className="opacity-90 transition-transform group-hover:scale-110"
                aria-hidden
              >
                <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.18)" />
                <path d="M9.5 7.5 17 12l-7.5 4.5Z" fill="#fff" />
              </svg>
              <span className="absolute bottom-1.5 right-1.5 rounded bg-black/55 px-1.5 py-0.5 font-data text-[10.5px] text-white tabular-nums">
                {v.duration}
              </span>
            </div>
            <p className="mt-1.5 line-clamp-2 font-body text-[12.5px] font-medium text-fg">
              {v.title}
            </p>
            <p className="font-data text-[10.5px] text-fg-faint">
              {SOURCE_LABEL[v.source]} &middot; {v.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
