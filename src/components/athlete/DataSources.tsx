import type { DataSource } from "@/lib/athletes";

export default function DataSources({ sources }: { sources: DataSource[] }) {
  return (
    <div>
      <h3 className="font-display uppercase tracking-wide text-[13px] text-fg-muted mb-2">
        Data sources
      </h3>
      <div className="flex flex-wrap gap-2">
        {sources.map((s) => (
          <span
            key={s.provider}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-raised px-3 py-1.5 font-body text-[12.5px] text-fg-muted"
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                background: s.verified ? "var(--color-good)" : "var(--color-fg-faint)",
              }}
              aria-hidden
            />
            <span className="font-medium text-fg">{s.provider}</span>
            <span className="text-fg-faint">&middot; {s.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
