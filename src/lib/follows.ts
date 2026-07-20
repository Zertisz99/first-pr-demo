import { prisma } from "@/lib/db";

export async function isFollowing(userId: string, athleteId: string): Promise<boolean> {
  const follow = await prisma.follow.findUnique({
    where: { followerId_athleteId: { followerId: userId, athleteId } },
    select: { id: true },
  });
  return !!follow;
}

export async function getFollowerCount(athleteId: string): Promise<number> {
  return prisma.follow.count({ where: { athleteId } });
}
