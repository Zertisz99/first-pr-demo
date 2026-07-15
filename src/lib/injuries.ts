import { prisma } from "@/lib/db";
import type { InjuryStatus } from "@/generated/prisma/client";

export type InjuryEntry = {
  id: string;
  athleteId: string;
  athleteName: string;
  injuryType: string;
  status: InjuryStatus;
  reportedDate: string;
  expectedReturnDate: string | null;
  notes: string | null;
};

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getTeamInjuries(teamId: string): Promise<InjuryEntry[]> {
  const members = await prisma.teamMember.findMany({
    where: { teamId, status: "active" },
    select: { athleteId: true },
  });
  const athleteIds = members.map((m) => m.athleteId);

  const injuries = await prisma.injury.findMany({
    where: { athleteId: { in: athleteIds } },
    orderBy: { reportedDate: "desc" },
    include: { athlete: { select: { name: true } } },
  });

  return injuries.map((i) => ({
    id: i.id,
    athleteId: i.athleteId,
    athleteName: i.athlete.name,
    injuryType: i.injuryType,
    status: i.status,
    reportedDate: toDateKey(i.reportedDate),
    expectedReturnDate: i.expectedReturnDate ? toDateKey(i.expectedReturnDate) : null,
    notes: i.notes,
  }));
}
