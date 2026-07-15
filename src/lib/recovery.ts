import { prisma } from "@/lib/db";

export { SORENESS_REGIONS, type SorenessRegion } from "@/lib/recovery-constants";

export type RecoveryEntry = {
  date: string;
  sleepHours: number;
  sleepQuality: number;
  fatigueScore: number;
  stressScore: number;
  moodScore: number;
  readinessScore: number;
  notes: string | null;
  soreness: { bodyRegion: string; intensity: number }[];
};

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayDateOnly(): Date {
  return new Date(`${toDateKey(new Date())}T00:00:00.000Z`);
}

function mapEntry(row: {
  logDate: Date;
  sleepHours: number;
  sleepQuality: number;
  fatigueScore: number;
  stressScore: number;
  moodScore: number;
  readinessScore: number;
  notes: string | null;
  sorenessEntries: { bodyRegion: string; intensity: number }[];
}): RecoveryEntry {
  return {
    date: toDateKey(row.logDate),
    sleepHours: row.sleepHours,
    sleepQuality: row.sleepQuality,
    fatigueScore: row.fatigueScore,
    stressScore: row.stressScore,
    moodScore: row.moodScore,
    readinessScore: row.readinessScore,
    notes: row.notes,
    soreness: row.sorenessEntries.map((s) => ({
      bodyRegion: s.bodyRegion,
      intensity: s.intensity,
    })),
  };
}

export async function getRecoveryHistory(
  athleteHandle: string,
  days = 28
): Promise<RecoveryEntry[]> {
  const rows = await prisma.recoveryLog.findMany({
    where: { athlete: { handle: athleteHandle } },
    include: { sorenessEntries: true },
    orderBy: { logDate: "asc" },
    take: days,
  });
  return rows.map(mapEntry);
}

export async function getTodayEntry(
  athleteHandle: string
): Promise<RecoveryEntry | null> {
  const row = await prisma.recoveryLog.findFirst({
    where: { athlete: { handle: athleteHandle }, logDate: todayDateOnly() },
    include: { sorenessEntries: true },
  });
  return row ? mapEntry(row) : null;
}
