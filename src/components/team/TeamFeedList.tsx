import type { TeamFeedItem } from "@/lib/teamFeed";

const TYPE_LABEL: Record<TeamFeedItem["type"], string> = {
  announcement: "Announcement",
  match: "Match",
  training: "Training",
};

export default function TeamFeedList({ items }: { items: TeamFeedItem[] }) {
  if (items.length === 0) {
    return <p className="font-body text-sm text-fg-faint">No team activity yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.id} className="rounded-lg border border-line bg-surface-raised p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-data text-[10.5px] uppercase tracking-wide text-fg-faint">
              {TYPE_LABEL[item.type]}
            </span>
            <span className="font-data text-[11px] text-fg-faint">{item.date}</span>
          </div>
          <p className="mt-1 font-body text-sm font-semibold text-fg">{item.title}</p>
          <p className="mt-0.5 font-body text-[12.5px] text-fg-muted">{item.detail}</p>
        </li>
      ))}
    </ul>
  );
}
