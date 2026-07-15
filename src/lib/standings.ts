import { prisma } from "@/lib/db";

export type StandingRow = {
  id: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
};

export async function getLeagueStandings(teamId: string): Promise<StandingRow[]> {
  const rows = await prisma.leagueStanding.findMany({
    where: { teamId },
    orderBy: [{ sortOrder: "asc" }, { points: "desc" }],
  });

  return rows.map((r) => ({
    id: r.id,
    teamName: r.teamName,
    played: r.played,
    won: r.won,
    drawn: r.drawn,
    lost: r.lost,
    points: r.points,
  }));
}
