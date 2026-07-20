import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getTeamPageData } from "@/lib/team-page";
import { getTeamAnnouncements } from "@/lib/announcements";
import { getTeamFeed } from "@/lib/teamFeed";
import { getVideoShareCounts } from "@/lib/videoShares";
import { STAFF_ROLE_LABELS } from "@/lib/staff";
import SportTheme from "@/components/SportTheme";
import ProfileTabs, { type ProfileTab } from "@/components/athlete/ProfileTabs";
import AnnouncementList from "@/components/AnnouncementList";
import TeamFeedList from "@/components/team/TeamFeedList";
import ShareButton from "@/components/athlete/ShareButton";

export default async function TeamPublicPage(props: PageProps<"/teams/[slug]">) {
  const { slug } = await props.params;
  const [team, session] = await Promise.all([getTeamPageData(slug), auth()]);

  if (!team) notFound();

  const isTeamMember =
    !!session?.user &&
    (await (async () => {
      if (session.user.role === "coach") {
        const owned = await prisma.team.findFirst({
          where: { id: team.id, coachId: session.user.id },
          select: { id: true },
        });
        return !!owned;
      }
      const member = await prisma.teamMember.findFirst({
        where: {
          teamId: team.id,
          status: "active",
          athlete: { userId: session.user.id },
        },
        select: { id: true },
      });
      return !!member;
    })());

  const [announcements, feed, shareCounts] = await Promise.all([
    isTeamMember ? getTeamAnnouncements(team.id) : Promise.resolve([]),
    isTeamMember ? getTeamFeed(team.id) : Promise.resolve([]),
    getVideoShareCounts(team.videos.map((v) => v.id)),
  ]);

  const tabs: ProfileTab[] = [
    ...(isTeamMember
      ? [
          {
            key: "feed",
            label: "Feed",
            content: <TeamFeedList items={feed} />,
          },
        ]
      : []),
    {
      key: "players",
      label: "Players",
      content:
        team.players.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {team.players.map((p) => (
              <li key={p.handle}>
                <Link
                  href={`/athletes/${p.handle}`}
                  className="flex items-center justify-between rounded-lg border border-line bg-surface-raised p-3 hover:border-line-strong"
                >
                  <span className="font-body text-sm font-semibold text-fg">
                    {p.name}
                    {p.verified && (
                      <span className="ml-2 font-data text-[10px] uppercase tracking-wide text-fg-faint">
                        Verified
                      </span>
                    )}
                  </span>
                  <span className="font-body text-[12.5px] text-fg-muted">{p.position}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-body text-sm text-fg-faint">No players listed yet.</p>
        ),
    },
    {
      key: "schedule",
      label: "Schedule",
      content:
        team.schedule.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {team.schedule.map((e, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg border border-line bg-surface-raised p-3"
              >
                <span className="font-body text-sm text-fg">{e.label}</span>
                <span className="font-data text-[12px] text-fg-faint">{e.date}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-body text-sm text-fg-faint">Nothing scheduled yet.</p>
        ),
    },
    {
      key: "standings",
      label: "League Table",
      content:
        team.standings.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface-raised">
                  <th className="px-4 py-2 text-left font-data text-[10.5px] uppercase tracking-wide text-fg-faint">
                    Team
                  </th>
                  <th className="px-4 py-2 text-right font-data text-[10.5px] uppercase tracking-wide text-fg-faint">
                    P
                  </th>
                  <th className="px-4 py-2 text-right font-data text-[10.5px] uppercase tracking-wide text-fg-faint">
                    W
                  </th>
                  <th className="px-4 py-2 text-right font-data text-[10.5px] uppercase tracking-wide text-fg-faint">
                    D
                  </th>
                  <th className="px-4 py-2 text-right font-data text-[10.5px] uppercase tracking-wide text-fg-faint">
                    L
                  </th>
                  <th className="px-4 py-2 text-right font-data text-[10.5px] uppercase tracking-wide text-fg-faint">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody>
                {team.standings.map((row, i) => (
                  <tr
                    key={row.id}
                    className={i % 2 === 0 ? "bg-surface-raised" : ""}
                    style={
                      row.teamName === team.name
                        ? { outline: "1px solid var(--color-accent)" }
                        : undefined
                    }
                  >
                    <td className="px-4 py-2 font-body text-[13px] text-fg">{row.teamName}</td>
                    <td className="px-4 py-2 text-right font-data text-[13px] tabular-nums text-fg-muted">
                      {row.played}
                    </td>
                    <td className="px-4 py-2 text-right font-data text-[13px] tabular-nums text-fg-muted">
                      {row.won}
                    </td>
                    <td className="px-4 py-2 text-right font-data text-[13px] tabular-nums text-fg-muted">
                      {row.drawn}
                    </td>
                    <td className="px-4 py-2 text-right font-data text-[13px] tabular-nums text-fg-muted">
                      {row.lost}
                    </td>
                    <td className="px-4 py-2 text-right font-data text-sm font-semibold tabular-nums text-fg">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="font-body text-sm text-fg-faint">No league table published yet.</p>
        ),
    },
    {
      key: "videos",
      label: "Videos",
      content:
        team.videos.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {team.videos.map((v) => (
              <div key={v.id} className="rounded-lg border border-line bg-surface-raised p-3">
                <a href={v.storageUrl} target="_blank" rel="noreferrer" className="block">
                  <p className="font-body text-[13px] font-semibold text-fg">{v.title}</p>
                  {v.description && (
                    <p className="mt-1 font-body text-[12px] text-fg-muted">{v.description}</p>
                  )}
                </a>
                <ShareButton
                  videoId={v.id}
                  url={v.storageUrl}
                  initialCount={shareCounts[v.id] ?? 0}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="font-body text-sm text-fg-faint">No public videos yet.</p>
        ),
    },
    {
      key: "stats",
      label: "Statistics",
      content: (
        <div className="rounded-lg border border-line bg-surface-raised p-4">
          {team.seasonRecord.played > 0 ? (
            <>
              <p className="font-display text-2xl font-bold text-fg">
                {team.seasonRecord.won}W {team.seasonRecord.drawn}D {team.seasonRecord.lost}L
              </p>
              <p className="font-data text-[12px] text-fg-faint">
                {team.seasonRecord.played} played · {team.seasonRecord.winPercent}% win rate
              </p>
            </>
          ) : (
            <p className="font-body text-sm text-fg-faint">No results recorded yet.</p>
          )}
        </div>
      ),
    },
    ...(isTeamMember
      ? [
          {
            key: "announcements",
            label: "Announcements",
            content: <AnnouncementList announcements={announcements} />,
          },
        ]
      : []),
    {
      key: "staff",
      label: "Staff",
      content:
        team.staff.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {team.staff.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-line bg-surface-raised p-3"
              >
                <span className="font-body text-sm font-semibold text-fg">{s.name}</span>
                <span className="font-data text-[11px] uppercase tracking-wide text-fg-faint">
                  {STAFF_ROLE_LABELS[s.role]}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-body text-sm text-fg-faint">{team.coachName} · Head Coach</p>
        ),
    },
    {
      key: "gallery",
      label: "Gallery",
      content:
        team.gallery.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {team.gallery.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                src={p.url}
                alt={p.caption ?? ""}
                className="aspect-square w-full rounded-lg border border-line object-cover"
              />
            ))}
          </div>
        ) : (
          <p className="font-body text-sm text-fg-faint">No photos yet.</p>
        ),
    },
  ];

  return (
    <SportTheme sport={team.sport}>
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <div
          className="mb-8 rounded-2xl border border-line p-6 sm:p-8"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--color-sport-live) 30%, var(--color-surface-sunken)) 0%, var(--color-surface-sunken) 70%)",
          }}
        >
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg sm:text-4xl">
            {team.name}
          </h1>
          <p className="mt-1 font-body text-sm text-fg-muted">
            {team.sportLabel}
            {team.ageGroup ? ` · ${team.ageGroup}` : ""} · Coached by {team.coachName}
          </p>
        </div>

        <ProfileTabs tabs={tabs} />
      </div>
    </SportTheme>
  );
}
