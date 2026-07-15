import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { SPORT_LABELS } from "@/lib/sports";
import { getTeamStaff, STAFF_ROLE_LABELS } from "@/lib/staff";
import { deleteStaffAction } from "@/lib/actions/staff";
import AddStaffForm from "@/components/coach/AddStaffForm";

export default async function TeamStaffPage(props: PageProps<"/coach/teams/[teamId]/staff">) {
  const { teamId } = await props.params;
  const session = await auth();
  if (!session?.user || session.user.role !== "coach") {
    redirect("/discover");
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();
  if (team.coachId !== session.user.id) redirect("/coach");

  const staff = await getTeamStaff(teamId);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <Link href="/coach" className="font-body text-[13px] text-fg-muted hover:text-fg">
        ← Coach dashboard
      </Link>

      <div className="mt-2 mb-8">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg">
          {team.name}
        </h1>
        <p className="mt-1 font-body text-sm text-fg-muted">
          {SPORT_LABELS[team.sport]} · coaching staff
        </p>
      </div>

      <div className="mb-8">
        <AddStaffForm teamId={teamId} />
      </div>

      {staff.length === 0 ? (
        <p className="font-body text-sm text-fg-faint">No staff added yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {staff.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-line bg-surface-raised p-4"
            >
              <div>
                <p className="font-body text-sm font-semibold text-fg">{s.name}</p>
                <p className="font-data text-[11px] uppercase tracking-wide text-fg-faint">
                  {STAFF_ROLE_LABELS[s.role]}
                  {s.email ? ` · ${s.email}` : ""}
                </p>
              </div>
              <form action={deleteStaffAction}>
                <input type="hidden" name="teamId" value={teamId} />
                <input type="hidden" name="staffId" value={s.id} />
                <button
                  type="submit"
                  className="font-body text-[12.5px] font-medium text-fg-muted hover:text-[var(--color-bad)]"
                >
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
