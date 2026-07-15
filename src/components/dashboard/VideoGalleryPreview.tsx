"use client";

import Link from "next/link";
import { Share2, Pencil, Trash2, Upload } from "lucide-react";
import type { AthleteVideoEntry } from "@/lib/videos";

export default function VideoGalleryPreview({
  handle,
  videos,
  accent,
}: {
  handle: string;
  videos: AthleteVideoEntry[];
  accent: string;
}) {
  async function share(url: string) {
    if (navigator.share) {
      await navigator.share({ url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-fg">
          Recent Videos
        </h2>
        <Link
          href={`/athletes/${handle}/videos`}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 font-body text-[12.5px] font-semibold"
          style={{ background: accent, color: "#fff" }}
        >
          <Upload size={14} />
          Upload
        </Link>
      </div>

      {videos.length === 0 ? (
        <p className="font-body text-sm text-fg-faint">No videos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {videos.map((video) => (
            <div key={video.id} className="group">
              <a
                href={video.storageUrl}
                target="_blank"
                rel="noreferrer"
                className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg"
                style={{
                  background: `linear-gradient(155deg, color-mix(in srgb, ${accent} 45%, var(--color-surface-sunken)) 0%, var(--color-surface-sunken) 100%)`,
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.18)" />
                  <path d="M9.5 7.5 17 12l-7.5 4.5Z" fill="#fff" />
                </svg>
              </a>
              <p className="mt-1.5 line-clamp-1 font-body text-[12.5px] font-medium text-fg">
                {video.title}
              </p>
              <p className="font-data text-[10px] text-fg-faint">{video.createdAt}</p>
              <div className="mt-1 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Link href={`/athletes/${handle}/videos`} aria-label="Edit" className="text-fg-faint hover:text-fg">
                  <Pencil size={12} />
                </Link>
                <Link href={`/athletes/${handle}/videos`} aria-label="Delete" className="text-fg-faint hover:text-[var(--color-bad)]">
                  <Trash2 size={12} />
                </Link>
                <button
                  type="button"
                  onClick={() => share(video.storageUrl)}
                  aria-label="Share"
                  className="text-fg-faint hover:text-fg"
                >
                  <Share2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
