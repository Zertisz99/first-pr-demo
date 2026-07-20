import Link from "next/link";
import { notFound } from "next/navigation";
import { getAthlete } from "@/lib/athletes";
import { getPendingInvites } from "@/lib/teams";
import { getPublicHighlights } from "@/lib/videos";
import {
  getWatchlistStatus,
  getPendingContactRequestStatus,
  getPendingContactRequests,
} from "@/lib/scouting";
import { isFollowing, getFollowerCount } from "@/lib/follows";
import { getHighlightLikeInfo } from "@/lib/highlightLikes";
import { getHighlightComments } from "@/lib/highlightComments";
import { getVideoShareCounts } from "@/lib/videoShares";
import { getAchievementLikeInfo } from "@/lib/achievementLikes";
import { getAchievementComments } from "@/lib/achievementComments";
import { SPORT_LIVE_ACCENT, SPORT_LIVE_ACCENT_SECONDARY } from "@/lib/sports";
import { auth } from "@/auth";
import SportTheme from "@/components/SportTheme";
import Cover from "@/components/athlete/Cover";
import StatRail from "@/components/athlete/StatRail";
import ProgressionChart from "@/components/athlete/ProgressionChart";
import HighlightReel from "@/components/athlete/HighlightReel";
import MatchHighlights from "@/components/athlete/MatchHighlights";
import DataSources from "@/components/athlete/DataSources";
import CareerSidebar from "@/components/athlete/CareerSidebar";
import ProfileTabs, { type ProfileTab } from "@/components/athlete/ProfileTabs";
import TeamInvites from "@/components/athlete/TeamInvites";
import ContactRequests from "@/components/athlete/ContactRequests";

export default async function AthleteProfilePage(props: PageProps<"/athletes/[handle]">) {
  const { handle } = await props.params;
  const [athlete, session] = await Promise.all([getAthlete(handle), auth()]);

  if (!athlete) notFound();

  const isOwner = !!session?.user && session.user.id === athlete.userId;
  const canScoutAthlete =
    session?.user?.role === "club" || session?.user?.role === "scout";
  const canFollow = !!session?.user && !isOwner;
  const canLikeHighlights = !!session?.user;
  const canCommentOnHighlights = !!session?.user;
  const [
    invites,
    matchHighlights,
    contactRequests,
    alreadyWatchlisted,
    hasPendingRequest,
    isFollowingAthlete,
    followerCount,
    highlightLikeInfo,
    highlightCommentInfo,
    achievementLikeInfo,
    achievementCommentInfo,
  ] = await Promise.all([
    isOwner ? getPendingInvites(handle) : Promise.resolve([]),
    getPublicHighlights(handle),
    isOwner ? getPendingContactRequests(handle) : Promise.resolve([]),
    canScoutAthlete ? getWatchlistStatus(session!.user.id, athlete.id) : Promise.resolve(false),
    canScoutAthlete
      ? getPendingContactRequestStatus(session!.user.id, athlete.id)
      : Promise.resolve(false),
    canFollow ? isFollowing(session!.user.id, athlete.id) : Promise.resolve(false),
    getFollowerCount(athlete.id),
    getHighlightLikeInfo(
      athlete.highlights.map((h) => h.id),
      session?.user?.id
    ),
    getHighlightComments(athlete.highlights.map((h) => h.id)),
    getAchievementLikeInfo(
      athlete.achievements.map((a) => a.id),
      session?.user?.id
    ),
    getAchievementComments(athlete.achievements.map((a) => a.id)),
  ]);

  const matchHighlightShareCounts = await getVideoShareCounts(
    matchHighlights.map((v) => v.id)
  );

  const tabs: ProfileTab[] = [
    {
      key: "overview",
      label: "Overview",
      content: (
        <div className="flex flex-col gap-8">
          <p className="max-w-[64ch] font-body text-[15px] leading-relaxed text-fg-muted">
            {athlete.bio}
          </p>
          {athlete.progression.points.length > 0 ? (
            <ProgressionChart
              title={athlete.progression.title}
              unit={athlete.progression.unit}
              points={athlete.progression.points}
              accent={SPORT_LIVE_ACCENT}
            />
          ) : (
            <p className="font-body text-sm text-fg-faint">
              No performance data logged yet.
            </p>
          )}
          <DataSources sources={athlete.dataSources} />
        </div>
      ),
    },
    {
      key: "stats",
      label: "Stats",
      content: (
        <div className="flex flex-col gap-6">
          {athlete.headlineStats.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="w-full border-collapse">
                <tbody>
                  {athlete.headlineStats.map((s, i) => (
                    <tr key={s.label} className={i % 2 === 0 ? "bg-surface-raised" : ""}>
                      <td className="px-4 py-2.5 font-body text-[13.5px] text-fg-muted">
                        {s.label}
                      </td>
                      <td className="px-4 py-2.5 text-right font-data text-sm font-semibold tabular-nums text-fg">
                        {s.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="font-body text-sm text-fg-faint">No stats logged yet.</p>
          )}
          <DataSources sources={athlete.dataSources} />
        </div>
      ),
    },
    {
      key: "videos",
      label: "Videos",
      content: (
        <div className="flex flex-col gap-8">
          {isOwner && (
            <Link
              href={`/athletes/${handle}/videos`}
              className="self-start font-body text-[13px] font-medium hover:underline"
              style={{ color: "var(--color-accent)" }}
            >
              Manage my videos →
            </Link>
          )}
          {matchHighlights.length > 0 && (
            <MatchHighlights
              videos={matchHighlights}
              accent={SPORT_LIVE_ACCENT}
              accentSecondary={SPORT_LIVE_ACCENT_SECONDARY}
              shareCounts={matchHighlightShareCounts}
            />
          )}
          {athlete.highlights.length > 0 && (
            <HighlightReel
              videos={athlete.highlights}
              accent={SPORT_LIVE_ACCENT}
              accentSecondary={SPORT_LIVE_ACCENT_SECONDARY}
              athleteHandle={handle}
              canLike={canLikeHighlights}
              likeInfo={highlightLikeInfo}
              canComment={canCommentOnHighlights}
              commentInfo={highlightCommentInfo}
            />
          )}
          {matchHighlights.length === 0 && athlete.highlights.length === 0 && (
            <p className="font-body text-sm text-fg-faint">No videos uploaded yet.</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <SportTheme sport={athlete.sport}>
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        {isOwner && <TeamInvites invites={invites} />}
        {isOwner && <ContactRequests requests={contactRequests} />}
        <Cover
          athlete={athlete}
          isOwner={isOwner}
          canScoutAthlete={canScoutAthlete}
          alreadyWatchlisted={alreadyWatchlisted}
          hasPendingRequest={hasPendingRequest}
          canFollow={canFollow}
          isFollowing={isFollowingAthlete}
          followerCount={followerCount}
        />

        <div className="mt-6">
          <StatRail athlete={athlete} />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
          <ProfileTabs tabs={tabs} />
          <aside>
            <CareerSidebar
              career={athlete.career}
              achievements={athlete.achievements}
              accent={SPORT_LIVE_ACCENT}
              athleteHandle={handle}
              canLike={canLikeHighlights}
              likeInfo={achievementLikeInfo}
              canComment={canCommentOnHighlights}
              commentInfo={achievementCommentInfo}
            />
          </aside>
        </div>
      </div>
    </SportTheme>
  );
}
