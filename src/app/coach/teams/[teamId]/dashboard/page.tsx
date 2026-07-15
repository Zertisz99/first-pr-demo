import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { SPORT_LABELS, SPORT_LIVE_ACCENT } from "@/lib/sports";
import { getCoachDashboardData } from "@/lib/coach-dashboard";
import SportTheme from "@/components/SportTheme";
import CoachDashboardShell from "@/components/coach/CoachDashboardShell";
import RecoveryMonitorWidget from "@/components/coach/RecoveryMonitorWidget";
import InjuryAlertsWidget from "@/components/coach/InjuryAlertsWidget";
import UpcomingEventsWidget from "@/components/coach/UpcomingEventsWidget";
import AnnouncementsFeed from "@/components/dashboard/AnnouncementsFeed";
import RosterSummaryWidget from "@/components/coach/RosterSummaryWidget";
import SeasonRecordWidget from "@/components/dashboard/SeasonRecordWidget";

export default async function CoachTeamDashboardPage(
  props: PageProps<"/coach/teams/[teamId]/dashboard">
) {
  const { teamId } = await props.params;
  const session = await auth();
  if (!session?.user || session.user.role !== "coach") {
    redirect("/discover");
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();
  if (team.coachId !== session.user.id) redirect("/coach");

  const data = await getCoachDashboardData(teamId);

  return (
    <SportTheme sport={team.sport}>
      <CoachDashboardShell
        teamId={teamId}
        teamSlug={team.slug}
        teamName={team.name}
        sportLabel={SPORT_LABELS[team.sport]}
        main={
          <>
            <div
              className="rounded-2xl border border-line p-6 sm:p-8"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--color-sport-live) 30%, var(--color-surface-sunken)) 0%, var(--color-surface-sunken) 70%)",
              }}
            >
              <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg sm:text-4xl">
                {team.name}
              </h1>
              <p className="mt-1 font-body text-sm text-fg-muted">
                {SPORT_LABELS[team.sport]} · coach portal
              </p>
            </div>

            <RecoveryMonitorWidget
              teamId={teamId}
              statuses={data.recoveryStatuses}
              accent={SPORT_LIVE_ACCENT}
            />
            <InjuryAlertsWidget
              teamId={teamId}
              injuries={data.injuries}
              accent={SPORT_LIVE_ACCENT}
            />
            <UpcomingEventsWidget
              teamId={teamId}
              events={data.upcomingEvents}
              accent={SPORT_LIVE_ACCENT}
            />
            <AnnouncementsFeed announcements={data.announcements} />
          </>
        }
        rightPanel={
          <>
            <SeasonRecordWidget record={data.seasonRecord} accent={SPORT_LIVE_ACCENT} />
            <RosterSummaryWidget roster={data.roster} accent={SPORT_LIVE_ACCENT} />
          </>
        }
      />
    </SportTheme>
  );
}
