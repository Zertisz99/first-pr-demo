import { prisma } from "@/lib/db";
import { todayDateOnly } from "@/lib/recovery";

export type AthleteRecoveryStatus = {
  athleteId: string;
  athleteName: string;
  loggedToday: boolean;
  readinessScore: number | null;
  sleepHours: number | null;
  fatigueScore: number | null;
};

export async function getTeamRecoveryStatus(teamId: string): Promise<AthleteRecoveryStatus[]> {
  const members = await prisma.teamMember.findMany({
    where: { teamId, status: "active" },
    include: { athlete: { select: { id: true, name: true } } },
    orderBy: { joinedAt: "asc" },
  });

  const athleteIds = members.map((m) => m.athlete.id);
  const logs = await prisma.recoveryLog.findMany({
    where: { athleteId: { in: athleteIds }, logDate: todayDateOnly() },
  });
  const logByAthlete = new Map(logs.map((l) => [l.athleteId, l]));

  return members.map((m) => {
    const log = logByAthlete.get(m.athlete.id);
    return {
      athleteId: m.athlete.id,
      athleteName: m.athlete.name,
      loggedToday: !!log,
      readinessScore: log?.readinessScore ?? null,
      sleepHours: log?.sleepHours ?? null,
      fatigueScore: log?.fatigueScore ?? null,
    };
  });
}
