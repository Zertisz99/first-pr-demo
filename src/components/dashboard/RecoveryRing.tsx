"use client";

import { motion } from "framer-motion";

const SIZE = 84;
const STROKE = 7;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function RecoveryRing({
  label,
  value,
  displayValue,
  accent,
}: {
  label: string;
  value: number;
  displayValue: string;
  accent: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  const offset = CIRCUMFERENCE * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth={STROKE}
          />
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={accent}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-data text-[13px] font-semibold tabular-nums text-fg">
          {displayValue}
        </div>
      </div>
      <span className="font-data text-[10px] uppercase tracking-wide text-fg-faint">
        {label}
      </span>
    </div>
  );
}
