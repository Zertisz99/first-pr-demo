"use client";

import { useMemo, useState } from "react";
import type { ProgressionPoint } from "@/lib/athletes";

const VIEW_W = 640;
const VIEW_H = 220;
const PAD_TOP = 28;
const PAD_BOTTOM = 28;
const PAD_X = 10;
const DOMAIN_MIN = 0;
const DOMAIN_MAX = 100;

function xFor(index: number, count: number) {
  if (count <= 1) return PAD_X;
  const usable = VIEW_W - PAD_X * 2;
  return PAD_X + (usable * index) / (count - 1);
}

function yFor(value: number) {
  const usable = VIEW_H - PAD_TOP - PAD_BOTTOM;
  const t = (value - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN);
  return PAD_TOP + usable * (1 - t);
}

export default function ProgressionChart({
  title,
  unit,
  points,
  accent,
}: {
  title: string;
  unit: string;
  points: ProgressionPoint[];
  accent: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { linePath, areaPath, coords } = useMemo(() => {
    const coords = points.map((p, i) => ({
      x: xFor(i, points.length),
      y: yFor(p.value),
      ...p,
    }));
    const line = coords
      .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
      .join(" ");
    const baseline = yFor(DOMAIN_MIN);
    const area =
      `M ${coords[0].x.toFixed(2)} ${baseline.toFixed(2)} ` +
      coords.map((c) => `L ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(" ") +
      ` L ${coords[coords.length - 1].x.toFixed(2)} ${baseline.toFixed(2)} Z`;
    return { linePath: line, areaPath: area, coords };
  }, [points]);

  const last = coords[coords.length - 1];
  const active = hoverIndex !== null ? coords[hoverIndex] : last;

  function handlePointerMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(frac * (coords.length - 1));
    setHoverIndex(Math.min(coords.length - 1, Math.max(0, idx)));
  }

  const gridLines = [0, 50, 100];

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-display uppercase tracking-wide text-[15px] text-fg">
          {title}
        </h3>
        <span className="font-data text-[11px] text-fg-faint">{unit}</span>
      </div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full h-auto block"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${title}: ${last.label} ${last.value}`}
        >
          {gridLines.map((g) => (
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

          <path d={areaPath} fill={accent} opacity={0.1} />
          <path
            d={linePath}
            fill="none"
            stroke={accent}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {hoverIndex !== null && (
            <line
              x1={active.x}
              x2={active.x}
              y1={PAD_TOP}
              y2={VIEW_H - PAD_BOTTOM}
              stroke="var(--color-line-strong)"
              strokeWidth={1}
            />
          )}

          {coords.map((c, i) => {
            const isEmphasized = i === coords.length - 1 || i === hoverIndex;
            if (!isEmphasized) return null;
            return (
              <circle
                key={i}
                cx={c.x}
                cy={c.y}
                r={5}
                fill={accent}
                stroke="var(--color-surface-raised)"
                strokeWidth={2}
              />
            );
          })}

          <text
            x={last.x}
            y={PAD_TOP - 10}
            textAnchor={coords.length === 1 ? "start" : "end"}
            className="font-data"
            fontSize={13}
            fontWeight={600}
            fill="var(--color-fg)"
          >
            {last.value}
          </text>

          <text
            x={PAD_X}
            y={VIEW_H - 8}
            className="font-data"
            fontSize={10}
            fill="var(--color-fg-faint)"
          >
            {coords[0].label}
          </text>
          {coords.length > 1 && (
            <text
              x={VIEW_W - PAD_X}
              y={VIEW_H - 8}
              textAnchor="end"
              className="font-data"
              fontSize={10}
              fill="var(--color-fg-faint)"
            >
              {last.label}
            </text>
          )}

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

        {hoverIndex !== null && (
          <div
            className="pointer-events-none absolute top-1 -translate-x-1/2 rounded-md border border-line bg-surface-raised px-2.5 py-1.5 shadow-sm"
            style={{ left: `${(active.x / VIEW_W) * 100}%` }}
          >
            <div className="font-data text-[13px] font-semibold text-fg tabular-nums">
              {active.value}
            </div>
            <div className="font-data text-[10px] text-fg-faint">{active.label}</div>
          </div>
        )}
      </div>
    </div>
  );
}
