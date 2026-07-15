import { prisma } from "@/lib/db";
import type { LineupRole, MatchOutcome } from "@/generated/prisma/client";

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export type LineupEntry = {
  athleteId: string;
  athleteName: string;
  defaultPosition: string;
  role: LineupRole | "none";
  position: string | null;
};

export type MatchEntry = {
  id: string;
  opponent: string;
  matchDate: string;
  venue: string | null;
  result: string | null;
  outcome: MatchOutcome | null;
  formation: string | null;
  lineup: LineupEntry[];
};

export async function getTeamMatches(teamId: string): Promise<MatchEntry[]> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        where: { status: "active" },
        include: { athlete: { select: { id: true, name: true, position: true } } },
        orderBy: { joinedAt: "asc" },
      },
      matches: {
        orderBy: { matchDate: "desc" },
        include: { lineups: true },
      },
    },
  });
  if (!team) return [];

  const roster = team.members.map((m) => ({
    id: m.athlete.id,
    name: m.athlete.name,
    position: m.athlete.position,
  }));

  return team.matches.map((match) => {
    const lineupByAthlete = new Map(match.lineups.map((l) => [l.athleteId, l]));
    return {
      id: match.id,
      opponent: match.opponent,
      matchDate: toDateKey(match.matchDate),
      venue: match.venue,
      result: match.result,
      outcome: match.outcome,
      formation: match.formation,
      lineup: roster.map((r) => {
        const entry = lineupByAthlete.get(r.id);
        return {
          athleteId: r.id,
          athleteName: r.name,
          defaultPosition: r.position,
          role: entry?.role ?? "none",
          position: entry?.position ?? null,
        };
      }),
    };
  });
}
