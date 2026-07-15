import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAthlete } from "@/lib/athletes";
import { getDashboardData } from "@/lib/dashboard";
import { SPORT_LABELS, SPORT_LIVE_ACCENT } from "@/lib/sports";
import { auth } from "@/auth";
import SportTheme from "@/components/SportTheme";
import DashboardShell from "@/components/dashboard/DashboardShell";
import HeroSection from "@/components/dashboard/HeroSection";
import RecoveryCard from "@/components/dashboard/RecoveryCard";
import TrainingSessionCard from "@/components/dashboard/TrainingSessionCard";
import UpcomingMatchCard from "@/components/dashboard/UpcomingMatchCard";
import WeeklyProgressChart from "@/components/dashboard/WeeklyProgressChart";
import GoalsSection from "@/components/dashboard/GoalsSection";
import VideoGalleryPreview from "@/components/dashboard/VideoGalleryPreview";
import RecoveryStreakWidget from "@/components/dashboard/RecoveryStreakWidget";
import ScoutActivityWidget from "@/components/dashboard/ScoutActivityWidget";
import SeasonRecordWidget from "@/components/dashboard/SeasonRecordWidget";
import AnnouncementsFeed from "@/components/dashboard/AnnouncementsFeed";

export default async function AthleteDashboardPage(
  props: PageProps<"/athletes/[handle]/dashboard">
) {
  const { handle } = await props.params;
  const [athleteIds, athlete, session] = await Promise.all([
    prisma.athlete.findUnique({ where: { handle }, select: { id: true, userId: true } }),
    getAthlete(handle),
    auth(),
  ]);

  if (!athleteIds || !athlete) notFound();
  if (!session?.user || session.user.id !== athleteIds.userId) {
    redirect(`/athletes/${handle}`);
  }

  const data = await getDashboardData(athleteIds.id, handle);

  return (
    <SportTheme sport={athlete.sport}>
      <DashboardShell
        handle={handle}
        name={athlete.name}
        sportLabel={SPORT_LABELS[athlete.sport]}
        main={
          <>
            <HeroSection name={athlete.name} recovery={data.recovery} />
            <RecoveryCard handle={handle} recovery={data.recovery} accent={SPORT_LIVE_ACCENT} />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <TrainingSessionCard
                handle={handle}
                session={data.nextSession}
                accent={SPORT_LIVE_ACCENT}
              />
              <UpcomingMatchCard handle={handle} match={data.nextMatch} accent={SPORT_LIVE_ACCENT} />
            </div>
            <WeeklyProgressChart data={data.weeklyMetrics} />
            <AnnouncementsFeed announcements={data.announcements} />
            <GoalsSection handle={handle} goals={data.goals} accent={SPORT_LIVE_ACCENT} />
            <VideoGalleryPreview
              handle={handle}
              videos={data.recentVideos}
              accent={SPORT_LIVE_ACCENT}
            />
          </>
        }
        rightPanel={
          <>
            <SeasonRecordWidget record={data.seasonRecord} accent={SPORT_LIVE_ACCENT} />
            <RecoveryStreakWidget streak={data.recoveryStreak} accent={SPORT_LIVE_ACCENT} />
            <ScoutActivityWidget
              profileViewCount={data.profileViewCount}
              watchlistCount={data.watchlistCount}
              recentVisitors={data.recentVisitors}
              accent={SPORT_LIVE_ACCENT}
            />
          </>
        }
      />
    </SportTheme>
  );
}
