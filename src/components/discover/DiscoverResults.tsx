"use client";

import { useMemo, useState } from "react";
import type { Athlete } from "@/lib/athletes";
import { SPORT_KEYS, SPORT_LABELS, SPORT_LIVE_ACCENT, type SportKey } from "@/lib/sports";
import AthleteCard from "@/components/athlete/AthleteCard";

export default function DiscoverResults({ athletes }: { athletes: Athlete[] }) {
  const [sport, setSport] = useState<SportKey | "all">("all");
  const [query, setQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const availableSports = useMemo(
    () => new Set(athletes.map((a) => a.sport)),
    [athletes]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return athletes.filter((a) => {
      if (sport !== "all" && a.sport !== sport) return false;
      if (verifiedOnly && !a.verified) return false;
      if (q) {
        const haystack =
          `${a.name} ${a.position} ${a.club} ${a.nationality}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [athletes, sport, query, verifiedOnly]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-6">
        <div>
          <label
            htmlFor="discover-search"
            className="mb-2 block font-display uppercase tracking-wide text-[13px] text-fg-muted"
          >
            Search
          </label>
          <input
            id="discover-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, position, club..."
            className="w-full rounded-md border border-line bg-surface-raised px-3 py-2 font-body text-sm text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2"
            style={{ outlineColor: "var(--color-accent)" }}
          />
        </div>

        <div>
          <h3 className="mb-2 font-display uppercase tracking-wide text-[13px] text-fg-muted">
            Sport
          </h3>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setSport("all")}
              className={[
                "rounded-md px-3 py-1.5 text-left font-body text-sm transition-colors",
                sport === "all"
                  ? "bg-surface-sunken font-semibold text-fg"
                  : "text-fg-muted hover:bg-surface-sunken",
              ].join(" ")}
            >
              All sports
            </button>
            {SPORT_KEYS.filter((key) => availableSports.has(key)).map((key) => {
              const isActive = sport === key;
              return (
                <button
                  key={key}
                  type="button"
                  data-sport={key}
                  onClick={() => setSport(key)}
                  className={[
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-left font-body text-sm transition-colors",
                    isActive
                      ? "bg-surface-sunken font-semibold text-fg"
                      : "text-fg-muted hover:bg-surface-sunken",
                  ].join(" ")}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: SPORT_LIVE_ACCENT }}
                    aria-hidden
                  />
                  {SPORT_LABELS[key]}
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex items-center gap-2 font-body text-sm text-fg-muted">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="h-4 w-4 rounded border-line-strong"
            style={{ accentColor: "var(--color-accent)" }}
          />
          Verified profiles only
        </label>
      </aside>

      <div>
        <p className="mb-4 font-data text-[12.5px] text-fg-faint">
          {filtered.length} {filtered.length === 1 ? "athlete" : "athletes"}
        </p>
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line-strong p-10 text-center">
            <p className="font-body text-sm text-fg-muted">
              No athletes match these filters. Try clearing search or switching sport.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((a) => (
              <AthleteCard key={a.handle} athlete={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
