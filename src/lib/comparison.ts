import { prisma } from "@/lib/db";
import type { AthleteStat } from "@/lib/athletes";

export type ComparisonAthlete = {
  id: string;
  name: string;
  position: string;
  headlineStats: AthleteStat[];
};

export async function getTeamRosterForComparison(
  teamId: string
): Promise<{ id: string; name: string }[]> {
  const members = await prisma.teamMember.findMany({
    where: { teamId, status: "active" },
    include: { athlete: { select: { id: true, name: true } } },
    orderBy: { joinedAt: "asc" },
  });
  return members.map((m) => ({ id: m.athlete.id, name: m.athlete.name }));
}

export async function getAthleteComparisonData(
  athleteIds: string[]
): Promise<ComparisonAthlete[]> {
  if (athleteIds.length === 0) return [];

  const athletes = await prisma.athlete.findMany({
    where: { id: { in: athleteIds } },
    select: { id: true, name: true, position: true, headlineStats: true },
  });

  const byId = new Map(athletes.map((a) => [a.id, a]));
  return athleteIds
    .map((id) => byId.get(id))
    .filter((a): a is NonNullable<typeof a> => !!a)
    .map((a) => ({
      id: a.id,
      name: a.name,
      position: a.position,
      headlineStats: a.headlineStats as unknown as AthleteStat[],
    }));
}
