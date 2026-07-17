import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageTeam } from "@/lib/teams";
import { SPORT_LABELS } from "@/lib/sports";
import { getTeamVideos } from "@/lib/videos";
import { untagAthleteAction, deleteVideoAction } from "@/lib/actions/videos";
import UploadVideoForm from "@/components/coach/UploadVideoForm";
import AddCommentForm from "@/components/coach/AddCommentForm";
import TagAthleteForm from "@/components/coach/TagAthleteForm";

export default async function TeamVideosPage(
  props: PageProps<"/coach/teams/[teamId]/videos">
) {
  const { teamId } = await props.params;
  const session = await auth();
  if (!session?.user || !["coach", "club"].includes(session.user.role)) {
    redirect("/discover");
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        where: { status: "active" },
        include: { athlete: { select: { id: true, name: true } } },
        orderBy: { joinedAt: "asc" },
      },
      matches: { orderBy: { matchDate: "desc" }, select: { id: true, opponent: true, matchDate: true } },
    },
  });
  if (!team) notFound();
  if (!(await canManageTeam(team, session.user.id))) redirect("/coach");

  const roster = team.members.map((m) => ({ id: m.athlete.id, name: m.athlete.name }));
  const matchOptions = team.matches.map((m) => ({
    id: m.id,
    label: `vs ${m.opponent} — ${m.matchDate.toISOString().slice(0, 10)}`,
  }));

  const videos = await getTeamVideos(teamId);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <Link
        href={session.user.role === "club" ? "/club" : "/coach"}
        className="font-body text-[13px] text-fg-muted hover:text-fg"
      >
        ← {session.user.role === "club" ? "Club" : "Coach"} dashboard
      </Link>

      <div className="mt-2 mb-8">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg">
          {team.name}
        </h1>
        <p className="mt-1 font-body text-sm text-fg-muted">
          {SPORT_LABELS[team.sport]} · video analysis
        </p>
      </div>

      <div className="mb-10">
        <UploadVideoForm teamId={teamId} matches={matchOptions} />
      </div>

      {videos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong p-10 text-center">
          <p className="font-body text-sm text-fg-muted">
            No videos yet — add one above.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {videos.map((video) => {
            const taggedIds = new Set(video.taggedAthletes.map((t) => t.athleteId));
            const untagged = roster.filter((r) => !taggedIds.has(r.id));

            return (
              <div
                key={video.id}
                className="rounded-lg border border-line bg-surface-raised p-5"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl font-bold uppercase tracking-wide text-fg">
                      {video.title}
                    </h2>
                    <p className="font-data text-[11px] uppercase tracking-wide text-fg-faint">
                      {video.createdAt}
                      {video.matchOpponent ? ` · vs ${video.matchOpponent}` : ""}
                      {" · "}
                      {video.visibility.replace("_", " ")}
                    </p>
                  </div>
                  <form action={deleteVideoAction}>
                    <input type="hidden" name="teamId" value={teamId} />
                    <input type="hidden" name="videoId" value={video.id} />
                    <button
                      type="submit"
                      className="font-body text-[12.5px] font-medium text-fg-muted hover:text-[var(--color-bad)]"
                    >
                      Remove
                    </button>
                  </form>
                </div>

                <a
                  href={video.storageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-body text-[13px] font-medium hover:underline"
                  style={{ color: "var(--color-accent)" }}
                >
                  Watch video →
                </a>

                {video.description && (
                  <p className="mt-2 font-body text-[13px] text-fg-muted">
                    {video.description}
                  </p>
                )}

                {video.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {video.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-line px-2 py-0.5 font-data text-[10px] uppercase tracking-wide text-fg-faint"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <h3 className="mb-2 font-display uppercase tracking-wide text-[12px] text-fg-muted">
                    Tagged athletes
                  </h3>
                  {video.taggedAthletes.length > 0 && (
                    <ul className="mb-2 flex flex-wrap gap-2">
                      {video.taggedAthletes.map((t) => (
                        <li key={t.athleteId}>
                          <form
                            action={untagAthleteAction}
                            className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1"
                          >
                            <input type="hidden" name="teamId" value={teamId} />
                            <input type="hidden" name="videoId" value={video.id} />
                            <input type="hidden" name="athleteId" value={t.athleteId} />
                            <span className="font-body text-[12px] text-fg">
                              {t.athleteName}
                            </span>
                            <button
                              type="submit"
                              className="font-body text-[12px] text-fg-muted hover:text-[var(--color-bad)]"
                            >
                              ×
                            </button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  )}
                  <TagAthleteForm teamId={teamId} videoId={video.id} candidates={untagged} />
                </div>

                <div className="mt-4">
                  <h3 className="mb-2 font-display uppercase tracking-wide text-[12px] text-fg-muted">
                    Comments
                  </h3>
                  {video.comments.length > 0 && (
                    <ul className="mb-3 flex flex-col gap-2">
                      {video.comments.map((c) => (
                        <li key={c.id} className="font-body text-[13px] text-fg">
                          <span className="font-semibold">{c.authorName}</span>
                          {c.timestampSeconds !== null ? (
                            <span className="ml-1.5 font-data text-[11px] text-fg-faint">
                              @{c.timestampSeconds}s
                            </span>
                          ) : null}
                          <span className="ml-1.5 text-fg-muted">{c.comment}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <AddCommentForm teamId={teamId} videoId={video.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
