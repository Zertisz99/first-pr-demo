import { prisma } from "@/lib/db";
import type { AnnouncementCategory } from "@/generated/prisma/client";

export type AnnouncementEntry = {
  id: string;
  category: AnnouncementCategory;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
};

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getTeamAnnouncements(teamId: string): Promise<AnnouncementEntry[]> {
  const rows = await prisma.announcement.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return rows.map((a) => ({
    id: a.id,
    category: a.category,
    title: a.title,
    body: a.body,
    authorName: a.author.name,
    createdAt: toDateKey(a.createdAt),
  }));
}
