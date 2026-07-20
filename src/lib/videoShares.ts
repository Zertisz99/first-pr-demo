import { prisma } from "@/lib/db";

export async function getVideoShareCounts(videoIds: string[]): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const id of videoIds) counts[id] = 0;
  if (videoIds.length === 0) return counts;

  const rows = await prisma.videoShare.groupBy({
    by: ["videoId"],
    where: { videoId: { in: videoIds } },
    _count: { videoId: true },
  });
  for (const r of rows) counts[r.videoId] = r._count.videoId;

  return counts;
}
