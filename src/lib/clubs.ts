import { prisma } from "@/lib/db";
import { SPORT_LABELS } from "@/lib/sports";
import type { RosterAthlete } from "@/lib/teams";
import type { SportKey } from "@/generated/prisma/client";

export type ClubProfile = {
  id: string;
  slug: string;
  name: string;
  country: string;
  city: string | null;
  foundedYear: number | null;
  crestUrl: string | null;
  description: string | null;
};

export async function getClubByAdminId(adminId: string): Promise<ClubProfile | null> {
  const club = await prisma.club.findUnique({ where: { adminId } });
  if (!club) return null;

  return {
    id: club.id,
    slug: club.slug,
    name: club.name,
    country: club.country,
    city: club.city,
    foundedYear: club.foundedYear,
    crestUrl: club.crestUrl,
    description: club.description,
  };
}

export type ClubSquad = {
  id: string;
  slug: string;
  name: string;
  sport: SportKey;
  sportLabel: string;
  ageGroup: string | null;
  members: RosterAthlete[];
};

export async function getClubTeams(clubId: string): Promise<ClubSquad[]> {
  const teams = await prisma.team.findMany({
    where: { clubId },
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
