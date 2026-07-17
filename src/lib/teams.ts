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
    where: {
      OR: [{ coachId }, { coachAssignments: { some: { coachId, status: "active" } } }],
    },
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

export async function canManageTeam(
  team: { id: string; coachId: string; clubId: string | null },
  userId: string
): Promise<boolean> {
  if (team.coachId === userId) return true;

  if (team.clubId) {
    const club = await prisma.club.findUnique({
      where: { id: team.clubId },
      select: { adminId: true },
    });
    if (club?.adminId === userId) return true;
  }

  const assignment = await prisma.squadCoachAssignment.findUnique({
    where: { teamId_coachId: { teamId: team.id, coachId: userId } },
    select: { status: true },
  });
  return assignment?.status === "active";
}

export type SquadCoach = {
  assignmentId: string;
  coachId: string;
  name: string;
  email: string;
  status: "pending" | "active";
};

export async function getSquadCoaches(teamId: string): Promise<SquadCoach[]> {
  const rows = await prisma.squadCoachAssignment.findMany({
    where: { teamId },
    orderBy: { invitedAt: "asc" },
    include: { coach: { select: { id: true, name: true, email: true } } },
  });

  return rows.map((r) => ({
    assignmentId: r.id,
    coachId: r.coach.id,
    name: r.coach.name,
    email: r.coach.email,
    status: r.status,
  }));
}

export type CoachInvite = {
  assignmentId: string;
  teamName: string;
  sportLabel: string;
  clubName: string;
};

export async function getPendingCoachInvites(coachUserId: string): Promise<CoachInvite[]> {
  const rows = await prisma.squadCoachAssignment.findMany({
    where: { status: "pending", coachId: coachUserId },
    include: { team: { include: { club: { select: { name: true } } } } },
    orderBy: { invitedAt: "asc" },
  });

  return rows.map((r) => ({
    assignmentId: r.id,
    teamName: r.team.name,
    sportLabel: SPORT_LABELS[r.team.sport],
    clubName: r.team.club?.name ?? "A club",
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
