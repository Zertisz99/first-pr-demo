import { prisma } from "@/lib/db";

export type AchievementCommentEntry = {
  id: string;
  comment: string;
  createdAt: string;
  userName: string;
};

export async function getAchievementComments(
  achievementIds: string[]
): Promise<Record<string, AchievementCommentEntry[]>> {
  const result: Record<string, AchievementCommentEntry[]> = {};
  for (const id of achievementIds) result[id] = [];
  if (achievementIds.length === 0) return result;

  const rows = await prisma.achievementComment.findMany({
    where: { achievementId: { in: achievementIds } },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  for (const row of rows) {
    result[row.achievementId].push({
      id: row.id,
      comment: row.comment,
      createdAt: row.createdAt.toISOString().slice(0, 10),
      userName: row.user.name,
    });
  }

  return result;
}
