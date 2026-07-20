import { prisma } from "@/lib/db";

export type WatchlistVideoActivity = {
  id: string;
  athleteHandle: string;
  athleteName: string;
  title: string;
  date: string;
};

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Only public videos — a scout is an external evaluator, not a team member,
// so this deliberately respects the same visibility boundary any other
// profile visitor gets. Recovery data and non-public videos are never
// exposed here, even for watchlisted athletes.
export async function getWatchlistVideoActivity(
  athleteIds: string[],
  limit = 8
): Promise<WatchlistVideoActivity[]> {
  if (athleteIds.length === 0) return [];

  const videos = await prisma.video.findMany({
    where: { athleteId: { in: athleteIds }, visibility: "public" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { athlete: { select: { handle: true, name: true } } },
  });

  return videos
    .filter((v) => v.athlete)
    .map((v) => ({
      id: v.id,
      athleteHandle: v.athlete!.handle,
      athleteName: v.athlete!.name,
      title: v.title,
      date: toDateKey(v.createdAt),
    }));
}

export type WatchlistAchievement = {
  athleteHandle: string;
  athleteName: string;
  title: string;
  period: string;
};

export async function getWatchlistAchievements(
  athleteIds: string[],
  limitPerAthlete = 2
): Promise<WatchlistAchievement[]> {
  if (athleteIds.length === 0) return [];

  const achievements = await prisma.achievement.findMany({
    where: { athleteId: { in: athleteIds } },
    orderBy: { sortOrder: "asc" },
    include: { athlete: { select: { handle: true, name: true } } },
  });

  const perAthleteCount: Record<string, number> = {};
  const result: WatchlistAchievement[] = [];
  for (const a of achievements) {
    const count = perAthleteCount[a.athleteId] ?? 0;
    if (count >= limitPerAthlete) continue;
    perAthleteCount[a.athleteId] = count + 1;
    result.push({
      athleteHandle: a.athlete.handle,
      athleteName: a.athlete.name,
      title: a.title,
      period: a.period,
    });
  }

  return result;
}
