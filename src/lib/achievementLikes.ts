import { prisma } from "@/lib/db";

export type AchievementLikeInfo = { count: number; likedByMe: boolean };

export async function getAchievementLikeInfo(
  achievementIds: string[],
  userId?: string
): Promise<Record<string, AchievementLikeInfo>> {
  const info: Record<string, AchievementLikeInfo> = {};
  if (achievementIds.length === 0) return info;

  for (const id of achievementIds) {
    info[id] = { count: 0, likedByMe: false };
  }

  const [counts, myLikes] = await Promise.all([
    prisma.achievementLike.groupBy({
      by: ["achievementId"],
      where: { achievementId: { in: achievementIds } },
      _count: { achievementId: true },
    }),
    userId
      ? prisma.achievementLike.findMany({
          where: { userId, achievementId: { in: achievementIds } },
          select: { achievementId: true },
        })
      : Promise.resolve([]),
  ]);

  for (const c of counts) {
    info[c.achievementId].count = c._count.achievementId;
  }
  for (const l of myLikes) {
    info[l.achievementId].likedByMe = true;
  }

  return info;
}
