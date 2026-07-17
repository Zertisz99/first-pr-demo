import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageTeam } from "@/lib/teams";
import { SPORT_LABELS } from "@/lib/sports";
import { getTeamInjuries } from "@/lib/injuries";
import { updateInjuryStatusAction, deleteInjuryAction } from "@/lib/actions/injuries";
import CreateInjuryForm from "@/components/coach/CreateInjuryForm";

const STATUS_COLORS: Record<string, string> = {
  active: "var(--color-bad)",
  recovering: "var(--color-warning)",
  cleared: "var(--color-good)",
};

export default async function TeamInjuriesPage(
  props: PageProps<"/coach/teams/[teamId]/injuries">
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
    },
  });
  if (!team) notFound();
  if (!(await canManageTeam(team, session.user.id))) redirect("/coach");

  const roster = team.members.map((m) => ({ id: m.athlete.id, name: m.athlete.name }));
  const injuries = await getTeamInjuries(teamId);

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
          {SPORT_LABELS[team.sport]} · injury tracking
        </p>
      </div>

      <div className="mb-8">
        <CreateInjuryForm teamId={teamId} roster={roster} />
      </div>

      {injuries.length === 0 ? (
        <p className="font-body text-sm text-fg-faint">No injuries logged.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {injuries.map((injury) => (
            <div
              key={`${injury.id}-${injury.status}`}
              className="rounded-lg border border-line bg-surface-raised p-4"
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-body text-sm font-semibold text-fg">
                    {injury.athleteName}
                  </p>
                  <p className="font-body text-[13px] text-fg-muted">{injury.injuryType}</p>
                  <p className="font-data text-[11px] text-fg-faint">
                    Reported {injury.reportedDate}
                    {injury.expectedReturnDate
                      ? ` · Expected return ${injury.expectedReturnDate}`
                      : ""}
                  </p>
                  {injury.notes && (
                    <p className="mt-1 font-body text-[12.5px] text-fg-muted">{injury.notes}</p>
                  )}
                </div>
                <span
                  className="rounded-full px-2 py-0.5 font-data text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    color: STATUS_COLORS[injury.status],
                    border: `1px solid ${STATUS_COLORS[injury.status]}`,
                  }}
                >
                  {injury.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <form action={updateInjuryStatusAction} className="flex items-center gap-2">
                  <input type="hidden" name="teamId" value={teamId} />
                  <input type="hidden" name="athleteId" value={injury.athleteId} />
                  <input type="hidden" name="injuryId" value={injury.id} />
                  <select
                    name="status"
                    defaultValue={injury.status}
                    className="rounded-md border border-line bg-surface-sunken px-2 py-1 font-body text-[12px] text-fg"
                  >
                    <option value="active">Active</option>
                    <option value="recovering">Recovering</option>
                    <option value="cleared">Cleared</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-md border border-line-strong px-2.5 py-1 font-body text-[12px] font-semibold text-fg"
                  >
                    Update
                  </button>
                </form>
                <form action={deleteInjuryAction}>
                  <input type="hidden" name="teamId" value={teamId} />
                  <input type="hidden" name="athleteId" value={injury.athleteId} />
                  <input type="hidden" name="injuryId" value={injury.id} />
                  <button
                    type="submit"
                    className="font-body text-[12px] font-medium text-fg-muted hover:text-[var(--color-bad)]"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
