"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";

export default function VideoThumbnail({
  url,
  title,
  accent,
  accentSecondary,
}: {
  url: string;
  title: string;
  accent: string;
  accentSecondary?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md"
        style={{
          background: `linear-gradient(155deg, color-mix(in srgb, ${accent} 45%, var(--color-surface-sunken)) 0%, color-mix(in srgb, ${accentSecondary ?? accent} 30%, var(--color-surface-sunken)) 100%)`,
        }}
        aria-label={`Play ${title}`}
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
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <video src={url} controls autoPlay className="w-full rounded-lg" />
      </Modal>
    </>
  );
}
