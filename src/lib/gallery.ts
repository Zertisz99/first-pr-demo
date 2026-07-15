import { prisma } from "@/lib/db";

export type PhotoEntry = {
  id: string;
  url: string;
  caption: string | null;
  createdAt: string;
};

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getTeamGallery(teamId: string): Promise<PhotoEntry[]> {
  const rows = await prisma.photo.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((p) => ({
    id: p.id,
    url: p.url,
    caption: p.caption,
    createdAt: toDateKey(p.createdAt),
  }));
}
