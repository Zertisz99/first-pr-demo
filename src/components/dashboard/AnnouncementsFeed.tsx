import AnnouncementList from "@/components/AnnouncementList";
import type { AnnouncementEntry } from "@/lib/announcements";

export default function AnnouncementsFeed({
  announcements,
}: {
  announcements: AnnouncementEntry[];
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-6">
      <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-fg">
        Team Announcements
      </h2>
      <AnnouncementList announcements={announcements} />
    </div>
  );
}
