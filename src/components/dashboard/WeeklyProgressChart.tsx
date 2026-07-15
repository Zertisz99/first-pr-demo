"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { DayMetrics } from "@/lib/dashboard";

const VIEW_W = 640;
const VIEW_H = 220;
const PAD_TOP = 16;
const PAD_BOTTOM = 24;
const PAD_X = 10;

const SERIES: { key: keyof Omit<DayMetrics, "label">; label: string; color: string }[] = [
  { key: "trainingLoad", label: "Training Load", color: "var(--color-sport-live)" },
  { key: "recovery", label: "Recovery", color: "var(--color-good)" },
  { key: "sleep", label: "Sleep", color: "var(--color-accent)" },
  { key: "energy", label: "Energy", color: "var(--color-warning)" },
];

function xFor(index: number, count: number) {
  if (count <= 1) return PAD_X;
  const usable = VIEW_W - PAD_X * 2;
  return PAD_X + (usable * index) / (count - 1);
}

function yFor(value: number) {
  const usable = VIEW_H - PAD_TOP - PAD_BOTTOM;
  return PAD_TOP + usable * (1 - value / 100);
}

export default function WeeklyProgressChart({ data }: { data: DayMetrics[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const paths = useMemo(
    () =>
      SERIES.map((s) => {
        const path = data
          .map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i, data.length).toFixed(2)} ${yFor(d[s.key]).toFixed(2)}`)
          .join(" ");
        return { ...s, path };
      }),
    [data]
  );

  const activeIndex = hoverIndex ?? data.length - 1;
  const active = data[activeIndex];

  function handlePointerMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(frac * (data.length - 1));
    setHoverIndex(Math.min(data.length - 1, Math.max(0, idx)));
  }

  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-fg">
          Weekly Progress
        </h2>
        <div className="flex flex-wrap gap-3">
          {SERIES.map((s) => (
            <span
              key={s.key}
              className="flex items-center gap-1.5 font-data text-[10.5px] uppercase tracking-wide text-fg-faint"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block h-auto w-full"
          preserveAspectRatio="none"
        >
          {[0, 50, 100].map((g) => (
            <line
              key={g}
              x1={PAD_X}
              x2={VIEW_W - PAD_X}
              y1={yFor(g)}
              y2={yFor(g)}
              stroke="var(--color-line)"
              strokeWidth={1}
            />
          ))}

          {paths.map((p, i) => (
            <motion.path
              key={p.key}
              d={p.path}
              fill="none"
              stroke={p.color}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: "easeOut" }}
            />
          ))}

          {hoverIndex !== null && (
            <line
              x1={xFor(hoverIndex, data.length)}
              x2={xFor(hoverIndex, data.length)}
              y1={PAD_TOP}
              y2={VIEW_H - PAD_BOTTOM}
              stroke="var(--color-line-strong)"
              strokeWidth={1}
            />
          )}

          {data.map((d, i) => (
            <text
              key={d.label}
              x={xFor(i, data.length)}
              y={VIEW_H - 6}
              textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
              className="font-data"
              fontSize={10}
              fill="var(--color-fg-faint)"
            >
              {d.label}
            </text>
          ))}

          <rect
            x={0}
            y={0}
            width={VIEW_W}
            height={VIEW_H}
            fill="transparent"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoverIndex(null)}
          />
        </svg>

        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-line bg-surface-raised px-2.5 py-1.5 shadow-sm"
          style={{ left: `${(xFor(activeIndex, data.length) / VIEW_W) * 100}%` }}
        >
          <div className="mb-1 font-data text-[10px] uppercase tracking-wide text-fg-faint">
            {active.label}
          </div>
          {SERIES.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5 font-data text-[11px] text-fg">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
              {active[s.key]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
