import { prisma } from "@/lib/db";

export type CalendarEvent = {
  date: string;
  type: "session" | "match";
  label: string;
};

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getTeamCalendarEvents(
  teamId: string,
  monthStart: Date,
  monthEnd: Date
): Promise<CalendarEvent[]> {
  const sessions = await prisma.trainingSession.findMany({
    where: { plan: { teamId }, sessionDate: { gte: monthStart, lte: monthEnd } },
    select: { sessionDate: true, sessionType: true },
  });
  const matches = await prisma.match.findMany({
    where: { teamId, matchDate: { gte: monthStart, lte: monthEnd } },
    select: { matchDate: true, opponent: true },
  });

  const events: CalendarEvent[] = [
    ...sessions.map((s) => ({
      date: toDateKey(s.sessionDate),
      type: "session" as const,
      label: s.sessionType,
    })),
    ...matches.map((m) => ({
      date: toDateKey(m.matchDate),
      type: "match" as const,
      label: `vs ${m.opponent}`,
    })),
  ];

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getUpcomingTeamEvents(
  teamId: string,
  limit = 5
): Promise<CalendarEvent[]> {
  const today = new Date(toDateKey(new Date()) + "T00:00:00.000Z");

  const sessions = await prisma.trainingSession.findMany({
    where: { plan: { teamId }, sessionDate: { gte: today } },
    orderBy: { sessionDate: "asc" },
    take: limit,
    select: { sessionDate: true, sessionType: true },
  });
  const matches = await prisma.match.findMany({
    where: { teamId, matchDate: { gte: today } },
    orderBy: { matchDate: "asc" },
    take: limit,
    select: { matchDate: true, opponent: true },
  });

  const events: CalendarEvent[] = [
    ...sessions.map((s) => ({
      date: toDateKey(s.sessionDate),
      type: "session" as const,
      label: s.sessionType,
    })),
    ...matches.map((m) => ({
      date: toDateKey(m.matchDate),
      type: "match" as const,
      label: `vs ${m.opponent}`,
    })),
  ];

  return events.sort((a, b) => a.date.localeCompare(b.date)).slice(0, limit);
}
