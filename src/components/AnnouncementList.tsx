import type { AnnouncementEntry } from "@/lib/announcements";

const CATEGORY_LABELS: Record<AnnouncementEntry["category"], string> = {
  general: "General",
  training_change: "Training change",
  match_update: "Match update",
  event: "Event",
};

const CATEGORY_COLORS: Record<AnnouncementEntry["category"], string> = {
  general: "var(--color-fg-faint)",
  training_change: "var(--color-accent)",
  match_update: "var(--color-good)",
  event: "var(--color-warning)",
};

export default function AnnouncementList({
  announcements,
  deleteSlot,
}: {
  announcements: AnnouncementEntry[];
  deleteSlot?: (announcementId: string) => React.ReactNode;
}) {
  if (announcements.length === 0) {
    return <p className="font-body text-sm text-fg-faint">No team posts yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {announcements.map((a) => (
        <div key={a.id} className="rounded-lg border border-line bg-surface-raised p-4">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 font-data text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: CATEGORY_COLORS[a.category], border: `1px solid ${CATEGORY_COLORS[a.category]}` }}
              >
                {CATEGORY_LABELS[a.category]}
              </span>
              <span className="font-body text-[12.5px] font-semibold text-fg">{a.authorName}</span>
              <span className="font-data text-[10.5px] text-fg-faint">{a.createdAt}</span>
            </div>
            {deleteSlot?.(a.id)}
          </div>
          <h3 className="font-body text-[14px] font-semibold text-fg">{a.title}</h3>
          <p className="mt-1 whitespace-pre-wrap font-body text-[13px] text-fg-muted">{a.body}</p>
        </div>
      ))}
    </div>
  );
}
