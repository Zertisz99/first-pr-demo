import { prisma } from "@/lib/db";
import { getLeagueStandings, type StandingRow } from "@/lib/standings";
import { getTeamStaff, type StaffEntry } from "@/lib/staff";
import { getTeamGallery, type PhotoEntry } from "@/lib/gallery";
import { getPublicTeamVideos, type PublicHighlight } from "@/lib/videos";
import { getSeasonRecord, type SeasonRecord } from "@/lib/season";
import { getUpcomingTeamEvents, type CalendarEvent } from "@/lib/calendar";
import { SPORT_LABELS } from "@/lib/sports";
import type { SportKey } from "@/generated/prisma/client";

export type PublicPlayer = {
  handle: string;
  name: string;
  position: string;
  verified: boolean;
};

export type TeamPageData = {
  id: string;
  slug: string;
  name: string;
  sport: SportKey;
  sportLabel: string;
  ageGroup: string | null;
  coachName: string;
  players: PublicPlayer[];
  schedule: CalendarEvent[];
  standings: StandingRow[];
  videos: PublicHighlight[];
  seasonRecord: SeasonRecord;
  staff: StaffEntry[];
  gallery: PhotoEntry[];
};

export async function getTeamPageData(slug: string): Promise<TeamPageData | null> {
  const team = await prisma.team.findUnique({
    where: { slug },
    include: {
      coach: { select: { name: true } },
      members: {
        where: { status: "active" },
        include: { athlete: { select: { handle: true, name: true, position: true, verified: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
  if (!team) return null;

  const players: PublicPlayer[] = team.members.map((m) => ({
    handle: m.athlete.handle,
    name: m.athlete.name,
    position: m.athlete.position,
    verified: m.athlete.verified,
  }));

  const schedule = await getUpcomingTeamEvents(team.id, 8);
  const standings = await getLeagueStandings(team.id);
  const videos = await getPublicTeamVideos(team.id);
  const seasonRecord = await getSeasonRecord(team.id);
  const staff = await getTeamStaff(team.id);
  const gallery = await getTeamGallery(team.id);

  return {
    id: team.id,
    slug: team.slug,
    name: team.name,
    sport: team.sport,
    sportLabel: SPORT_LABELS[team.sport],
    ageGroup: team.ageGroup,
    coachName: team.coach.name,
    players,
    schedule,
    standings,
    videos,
    seasonRecord,
    staff,
    gallery,
  };
}
