import { prisma } from "@/lib/db";
import { SPORT_LABELS } from "@/lib/sports";
import type { SportKey, TeamMemberStatus } from "@/generated/prisma/client";

export type RosterAthlete = {
  id: string;
  handle: string;
  name: string;
  position: string;
  status: TeamMemberStatus;
};

export type CoachTeam = {
  id: string;
  slug: string;
  name: string;
  sport: SportKey;
  sportLabel: string;
  ageGroup: string | null;
  members: RosterAthlete[];
};

export async function getCoachTeams(coachId: string): Promise<CoachTeam[]> {
  const teams = await prisma.team.findMany({
    where: { coachId },
    orderBy: { createdAt: "asc" },
    include: {
      members: {
        include: {
          athlete: { select: { id: true, handle: true, name: true, position: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  return teams.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    sport: t.sport,
    sportLabel: SPORT_LABELS[t.sport],
    ageGroup: t.ageGroup,
    members: t.members.map((m) => ({
      id: m.athlete.id,
      handle: m.athlete.handle,
      name: m.athlete.name,
      position: m.athlete.position,
      status: m.status,
    })),
  }));
}

export type AthleteInvite = {
  teamMemberId: string;
  teamName: string;
  sportLabel: string;
  coachName: string;
};

export async function getPendingInvites(athleteHandle: string): Promise<AthleteInvite[]> {
  const invites = await prisma.teamMember.findMany({
    where: { status: "pending", athlete: { handle: athleteHandle } },
    include: { team: { include: { coach: { select: { name: true } } } } },
    orderBy: { joinedAt: "asc" },
  });

  return invites.map((i) => ({
    teamMemberId: i.id,
    teamName: i.team.name,
    sportLabel: SPORT_LABELS[i.team.sport],
    coachName: i.team.coach.name,
  }));
}
