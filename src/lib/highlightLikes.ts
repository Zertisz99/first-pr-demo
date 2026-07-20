import { prisma } from "@/lib/db";

export type HighlightLikeInfo = { count: number; likedByMe: boolean };

export async function getHighlightLikeInfo(
  highlightIds: string[],
  userId?: string
): Promise<Record<string, HighlightLikeInfo>> {
  const info: Record<string, HighlightLikeInfo> = {};
  if (highlightIds.length === 0) return info;

  for (const id of highlightIds) {
    info[id] = { count: 0, likedByMe: false };
  }

  const [counts, myLikes] = await Promise.all([
    prisma.highlightLike.groupBy({
      by: ["highlightVideoId"],
      where: { highlightVideoId: { in: highlightIds } },
      _count: { highlightVideoId: true },
    }),
    userId
      ? prisma.highlightLike.findMany({
          where: { userId, highlightVideoId: { in: highlightIds } },
          select: { highlightVideoId: true },
        })
      : Promise.resolve([]),
  ]);

  for (const c of counts) {
    info[c.highlightVideoId].count = c._count.highlightVideoId;
  }
  for (const l of myLikes) {
    info[l.highlightVideoId].likedByMe = true;
  }

  return info;
}
