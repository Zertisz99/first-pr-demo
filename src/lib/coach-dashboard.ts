import { prisma } from "@/lib/db";
import { getTeamRecoveryStatus, type AthleteRecoveryStatus } from "@/lib/team-recovery";
import { getTeamInjuries, type InjuryEntry } from "@/lib/injuries";
import { getUpcomingTeamEvents, type CalendarEvent } from "@/lib/calendar";
import { getTeamAnnouncements, type AnnouncementEntry } from "@/lib/announcements";
import { getSeasonRecord, type SeasonRecord } from "@/lib/season";
import { getRecentTeamVideos, type AthleteVideoEntry } from "@/lib/videos";
import type { RosterMember } from "@/components/coach/RosterSummaryWidget";

export type CoachDashboardData = {
  roster: RosterMember[];
  recoveryStatuses: AthleteRecoveryStatus[];
  injuries: InjuryEntry[];
  upcomingEvents: CalendarEvent[];
  announcements: AnnouncementEntry[];
  seasonRecord: SeasonRecord;
  recentVideos: AthleteVideoEntry[];
};

export async function getCoachDashboardData(teamId: string): Promise<CoachDashboardData> {
  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: { athlete: { select: { name: true, position: true } } },
    orderBy: { joinedAt: "asc" },
  });
  const roster: RosterMember[] = members.map((m) => ({
    name: m.athlete.name,
    position: m.athlete.position,
    status: m.status,
  }));

  const recoveryStatuses = await getTeamRecoveryStatus(teamId);
  const injuries = await getTeamInjuries(teamId);
  const upcomingEvents = await getUpcomingTeamEvents(teamId, 5);
  const announcements = await getTeamAnnouncements(teamId);
  const seasonRecord = await getSeasonRecord(teamId);
  const recentVideos = await getRecentTeamVideos(teamId, 4);

  return {
    roster,
    recoveryStatuses,
    injuries,
    upcomingEvents,
    announcements: announcements.slice(0, 5),
    seasonRecord,
    recentVideos,
  };
}
