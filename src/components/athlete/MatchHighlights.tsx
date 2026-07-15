import type { PublicHighlight } from "@/lib/videos";

export default function MatchHighlights({
  videos,
  accent,
}: {
  videos: PublicHighlight[];
  accent: string;
}) {
  return (
    <div>
      <h3 className="mb-3 font-display uppercase tracking-wide text-[15px] text-fg">
        Match Highlights
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {videos.map((v) => (
          <a
            key={v.id}
            href={v.storageUrl}
            target="_blank"
            rel="noreferrer"
            className="group rounded-lg border border-line bg-surface-raised p-3"
          >
            <div
              className="relative flex aspect-video items-center justify-center overflow-hidden rounded-md"
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
            </div>
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
          </a>
        ))}
      </div>
    </div>
  );
}
