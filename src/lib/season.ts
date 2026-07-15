import { prisma } from "@/lib/db";

export type SeasonRecord = {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  winPercent: number;
};

export async function getSeasonRecord(teamId: string): Promise<SeasonRecord> {
  const matches = await prisma.match.findMany({
    where: { teamId, outcome: { not: null } },
    select: { outcome: true },
  });

  const won = matches.filter((m) => m.outcome === "win").length;
  const drawn = matches.filter((m) => m.outcome === "draw").length;
  const lost = matches.filter((m) => m.outcome === "loss").length;
  const played = matches.length;

  return {
    played,
    won,
    drawn,
    lost,
    winPercent: played > 0 ? Math.round((won / played) * 100) : 0,
  };
}
