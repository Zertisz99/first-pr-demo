import { Eye, Bookmark } from "lucide-react";
import type { RecentVisitor } from "@/lib/dashboard";

export default function ScoutActivityWidget({
  profileViewCount,
  watchlistCount,
  recentVisitors,
  accent,
}: {
  profileViewCount: number;
  watchlistCount: number;
  recentVisitors: RecentVisitor[];
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-raised p-4">
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <Eye size={14} color={accent} />
            <span className="font-data text-[10px] uppercase tracking-wide text-fg-faint">
              Profile Views
            </span>
          </div>
          <p className="font-display text-xl font-bold text-fg">{profileViewCount}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <Bookmark size={14} color={accent} />
            <span className="font-data text-[10px] uppercase tracking-wide text-fg-faint">
              Watchlisted
            </span>
          </div>
          <p className="font-display text-xl font-bold text-fg">{watchlistCount}</p>
        </div>
      </div>

      {recentVisitors.length > 0 && (
        <div>
          <p className="mb-1.5 font-data text-[10px] uppercase tracking-wide text-fg-faint">
            Recent Visitors
          </p>
          <ul className="flex flex-col gap-1">
            {recentVisitors.map((v, i) => (
              <li
                key={i}
                className="flex items-center justify-between font-body text-[12px] text-fg-muted"
              >
                <span className="truncate">{v.name}</span>
                <span className="font-data text-[10px] text-fg-faint">{v.viewedAt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
