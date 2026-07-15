import { prisma } from "@/lib/db";
import { getAthleteVideos, type AthleteVideoEntry } from "@/lib/videos";
import { getAthleteGoals, type AthleteGoal } from "@/lib/goals";
import { getTeamAnnouncements, type AnnouncementEntry } from "@/lib/announcements";
import { getSeasonRecord, type SeasonRecord } from "@/lib/season";
import { todayDateOnly } from "@/lib/recovery";

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export type NextSession = {
  id: string;
  title: string;
  sessionType: string;
  date: string;
  durationMin: number;
  teamName: string;
  coachName: string;
};

export type NextMatch = {
  id: string;
  opponent: string;
  matchDate: string;
  venue: string | null;
  teamName: string;
};

export type RecoverySnapshot = {
  sleepHours: number;
  readinessScore: number;
  fatigueScore: number;
  soreness: number;
  wellnessScore: number;
} | null;

export type DayMetrics = {
  label: string;
  trainingLoad: number;
  recovery: number;
  sleep: number;
  energy: number;
};

export type RecentVisitor = {
  name: string;
  role: string;
  viewedAt: string;
};

export type DashboardData = {
  nextSession: NextSession | null;
  nextMatch: NextMatch | null;
  recovery: RecoverySnapshot;
  recoveryStreak: number;
  recentVideos: AthleteVideoEntry[];
  goals: AthleteGoal[];
  weeklyMetrics: DayMetrics[];
  profileViewCount: number;
  watchlistCount: number;
  recentVisitors: RecentVisitor[];
  announcements: AnnouncementEntry[];
  seasonRecord: SeasonRecord | null;
};

async function getFirstActiveTeamId(athleteId: string): Promise<string | null> {
  const membership = await prisma.teamMember.findFirst({
    where: { athleteId, status: "active" },
    select: { teamId: true },
    orderBy: { joinedAt: "asc" },
  });
  return membership?.teamId ?? null;
}

async function getNextSession(teamId: string | null): Promise<NextSession | null> {
  if (!teamId) return null;

  const session = await prisma.trainingSession.findFirst({
    where: { plan: { teamId }, sessionDate: { gte: todayDateOnly() } },
    orderBy: { sessionDate: "asc" },
    include: { plan: { include: { team: { include: { coach: { select: { name: true } } } } } } },
  });
  if (!session) return null;

  return {
    id: session.id,
    title: session.plan.title,
    sessionType: session.sessionType,
    date: toDateKey(session.sessionDate),
    durationMin: session.durationMin,
    teamName: session.plan.team.name,
    coachName: session.plan.team.coach.name,
  };
}

async function getNextMatch(teamId: string | null): Promise<NextMatch | null> {
  if (!teamId) return null;

  const match = await prisma.match.findFirst({
    where: { teamId, matchDate: { gte: new Date() } },
    orderBy: { matchDate: "asc" },
    include: { team: { select: { name: true } } },
  });
  if (!match) return null;

  return {
    id: match.id,
    opponent: match.opponent,
    matchDate: match.matchDate.toISOString(),
    venue: match.venue,
    teamName: match.team.name,
  };
}

async function getRecoverySnapshot(athleteId: string): Promise<RecoverySnapshot> {
  const log = await prisma.recoveryLog.findFirst({
    where: { athleteId, logDate: todayDateOnly() },
    include: { sorenessEntries: true },
  });
  if (!log) return null;

  const avgSoreness =
    log.sorenessEntries.length > 0
      ? Math.round(
          (log.sorenessEntries.reduce((sum, s) => sum + s.intensity, 0) /
            log.sorenessEntries.length) *
            10
        )
      : 0;

  return {
    sleepHours: log.sleepHours,
    readinessScore: log.readinessScore,
    fatigueScore: log.fatigueScore * 10,
    soreness: avgSoreness,
    wellnessScore: Math.round((log.readinessScore + (100 - avgSoreness)) / 2),
  };
}

async function getRecoveryStreak(athleteId: string): Promise<number> {
  const logs = await prisma.recoveryLog.findMany({
    where: { athleteId },
    orderBy: { logDate: "desc" },
    take: 60,
    select: { logDate: true },
  });

  const dates = new Set(logs.map((l) => toDateKey(l.logDate)));
  let streak = 0;
  const cursor = new Date(todayDateOnly());
  while (dates.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

async function getWeeklyMetrics(athleteId: string): Promise<DayMetrics[]> {
  const today = todayDateOnly();
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 6);

  const logs = await prisma.recoveryLog.findMany({
    where: { athleteId, logDate: { gte: start, lte: today } },
    select: { logDate: true, sleepHours: true, readinessScore: true, moodScore: true },
  });
  const sessionLogs = await prisma.sessionLog.findMany({
    where: {
      athleteId,
      completed: true,
      session: { sessionDate: { gte: start, lte: today } },
    },
    select: { actualDurationMin: true, session: { select: { sessionDate: true, durationMin: true } } },
  });

  const byDate = new Map<string, DayMetrics>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    const key = toDateKey(d);
    const jsWeekday = d.getUTCDay();
    const labelIndex = jsWeekday === 0 ? 6 : jsWeekday - 1;
    byDate.set(key, {
      label: DAY_LABELS[labelIndex],
      trainingLoad: 0,
      recovery: 0,
      sleep: 0,
      energy: 0,
    });
  }

  for (const log of logs) {
    const key = toDateKey(log.logDate);
    const entry = byDate.get(key);
    if (!entry) continue;
    entry.recovery = log.readinessScore;
    entry.sleep = Math.round(Math.min(100, (log.sleepHours / 10) * 100));
    entry.energy = log.moodScore * 10;
  }

  for (const sl of sessionLogs) {
    const key = toDateKey(sl.session.sessionDate);
    const entry = byDate.get(key);
    if (!entry) continue;
    const minutes = sl.actualDurationMin ?? sl.session.durationMin;
    entry.trainingLoad = Math.min(100, Math.round((minutes / 90) * 100));
  }

  return Array.from(byDate.values());
}

export async function getDashboardData(
  athleteId: string,
  athleteHandle: string
): Promise<DashboardData> {
  const teamId = await getFirstActiveTeamId(athleteId);

  const nextSession = await getNextSession(teamId);
  const nextMatch = await getNextMatch(teamId);
  const recovery = await getRecoverySnapshot(athleteId);
  const recoveryStreak = await getRecoveryStreak(athleteId);
  const recentVideos = await getAthleteVideos(athleteId);
  const goals = await getAthleteGoals(athleteId);
  const weeklyMetrics = await getWeeklyMetrics(athleteId);
  const profileViewCount = await prisma.profileView.count({ where: { athleteId } });
  const watchlistCount = await prisma.scoutWatchlist.count({ where: { athleteId } });
  const recentVisitorRows = await prisma.profileView.findMany({
    where: { athleteId },
    orderBy: { viewedAt: "desc" },
    take: 5,
    include: { viewer: { select: { name: true, role: true } } },
  });
  const announcements = teamId ? await getTeamAnnouncements(teamId) : [];
  const seasonRecord = teamId ? await getSeasonRecord(teamId) : null;

  return {
    nextSession,
    nextMatch,
    recovery,
    recoveryStreak,
    recentVideos: recentVideos.slice(0, 4),
    goals,
    weeklyMetrics,
    profileViewCount,
    watchlistCount,
    recentVisitors: recentVisitorRows.map((v) => ({
      name: v.viewer.name,
      role: v.viewer.role,
      viewedAt: toDateKey(v.viewedAt),
    })),
    announcements: announcements.slice(0, 5),
    seasonRecord,
  };
}
