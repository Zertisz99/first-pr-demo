import Link from "next/link";
import type { AthleteVideoEntry } from "@/lib/videos";

export default function TeamVideosWidget({
  teamId,
  videos,
  accent,
}: {
  teamId: string;
  videos: AthleteVideoEntry[];
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-fg">
          Recent Videos
        </h2>
        <Link
          href={`/coach/teams/${teamId}/videos`}
          className="font-body text-[12.5px] font-semibold hover:underline"
          style={{ color: accent }}
        >
          Manage videos →
        </Link>
      </div>

      {videos.length === 0 ? (
        <p className="font-body text-sm text-fg-faint">No videos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.storageUrl}
              target="_blank"
              rel="noreferrer"
              className="group block"
            >
              <div
                className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg"
                style={{
                  background: `linear-gradient(155deg, color-mix(in srgb, ${accent} 45%, var(--color-surface-sunken)) 0%, var(--color-surface-sunken) 100%)`,
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="opacity-90 transition-transform group-hover:scale-110"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.18)" />
                  <path d="M9.5 7.5 17 12l-7.5 4.5Z" fill="#fff" />
                </svg>
              </div>
              <p className="mt-1.5 line-clamp-1 font-body text-[12.5px] font-medium text-fg">
                {video.title}
              </p>
              <p className="font-data text-[10px] text-fg-faint">{video.createdAt}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
