import { prisma } from "@/lib/db";

export type TeamFeedItem = {
  id: string;
  type: "announcement" | "match" | "training";
  date: string;
  title: string;
  detail: string;
};

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getTeamFeed(teamId: string, limit = 20): Promise<TeamFeedItem[]> {
  const [announcements, matches, sessions] = await Promise.all([
    prisma.announcement.findMany({
      where: { teamId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.match.findMany({
      where: { teamId, matchDate: { lte: new Date() } },
      orderBy: { matchDate: "desc" },
      take: limit,
    }),
    prisma.trainingSession.findMany({
      where: { plan: { teamId } },
      orderBy: { sessionDate: "desc" },
      take: limit,
    }),
  ]);

  const items: TeamFeedItem[] = [
    ...announcements.map((a) => ({
      id: `announcement-${a.id}`,
      type: "announcement" as const,
      date: toDateKey(a.createdAt),
      title: a.title,
      detail: a.body,
    })),
    ...matches.map((m) => ({
      id: `match-${m.id}`,
      type: "match" as const,
      date: toDateKey(m.matchDate),
      title: `vs ${m.opponent}`,
      detail: m.result ? `${m.outcome ? `${m.outcome} · ` : ""}${m.result}` : "Match day",
    })),
    ...sessions.map((s) => ({
      id: `training-${s.id}`,
      type: "training" as const,
      date: toDateKey(s.sessionDate),
      title: `${s.sessionType} session`,
      detail: `${s.durationMin} min · ${s.intensityLabel} intensity`,
    })),
  ];

  items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return items.slice(0, limit);
}
