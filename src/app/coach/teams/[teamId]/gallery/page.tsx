import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageTeam } from "@/lib/teams";
import { SPORT_LABELS } from "@/lib/sports";
import { getTeamGallery } from "@/lib/gallery";
import { deletePhotoAction } from "@/lib/actions/gallery";
import AddPhotoForm from "@/components/coach/AddPhotoForm";

export default async function TeamGalleryPage(props: PageProps<"/coach/teams/[teamId]/gallery">) {
  const { teamId } = await props.params;
  const session = await auth();
  if (!session?.user || !["coach", "club"].includes(session.user.role)) {
    redirect("/discover");
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();
  if (!(await canManageTeam(team, session.user.id))) redirect("/coach");

  const photos = await getTeamGallery(teamId);

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
          {SPORT_LABELS[team.sport]} · photo gallery
        </p>
      </div>

      <div className="mb-8">
        <AddPhotoForm teamId={teamId} />
      </div>

      {photos.length === 0 ? (
        <p className="font-body text-sm text-fg-faint">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((p) => (
            <div key={p.id} className="group relative">
              <img
                src={p.url}
                alt={p.caption ?? ""}
                className="aspect-square w-full rounded-lg border border-line object-cover"
              />
              {p.caption && (
                <p className="mt-1 line-clamp-1 font-body text-[12px] text-fg-muted">
                  {p.caption}
                </p>
              )}
              <form action={deletePhotoAction} className="mt-1">
                <input type="hidden" name="teamId" value={teamId} />
                <input type="hidden" name="photoId" value={p.id} />
                <button
                  type="submit"
                  className="font-body text-[11.5px] font-medium text-fg-muted hover:text-[var(--color-bad)]"
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
