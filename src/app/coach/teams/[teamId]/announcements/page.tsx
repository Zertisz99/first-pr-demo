import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageTeam } from "@/lib/teams";
import { SPORT_LABELS } from "@/lib/sports";
import { getTeamAnnouncements } from "@/lib/announcements";
import { deleteAnnouncementAction } from "@/lib/actions/announcements";
import CreateAnnouncementForm from "@/components/coach/CreateAnnouncementForm";
import AnnouncementList from "@/components/AnnouncementList";

export default async function TeamAnnouncementsPage(
  props: PageProps<"/coach/teams/[teamId]/announcements">
) {
  const { teamId } = await props.params;
  const session = await auth();
  if (!session?.user || !["coach", "club"].includes(session.user.role)) {
    redirect("/discover");
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();
  if (!(await canManageTeam(team, session.user.id))) redirect("/coach");

  const announcements = await getTeamAnnouncements(teamId);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
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
          {SPORT_LABELS[team.sport]} · team announcements
        </p>
      </div>

      <div className="mb-8">
        <CreateAnnouncementForm teamId={teamId} />
      </div>

      <AnnouncementList
        announcements={announcements}
        deleteSlot={(announcementId) => (
          <form action={deleteAnnouncementAction}>
            <input type="hidden" name="teamId" value={teamId} />
            <input type="hidden" name="announcementId" value={announcementId} />
            <button
              type="submit"
              className="font-body text-[12px] font-medium text-fg-muted hover:text-[var(--color-bad)]"
            >
              Delete
            </button>
          </form>
        )}
      />
    </div>
  );
}
