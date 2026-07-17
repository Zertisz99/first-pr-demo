import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCoachTeams, getPendingCoachInvites } from "@/lib/teams";
import { getAllAthletes } from "@/lib/athletes";
import { removeTeamMemberAction } from "@/lib/actions/team";
import CreateTeamForm from "@/components/coach/CreateTeamForm";
import AddMemberForm from "@/components/coach/AddMemberForm";
import SquadInvites from "@/components/coach/SquadInvites";

export default async function CoachDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "coach") {
    redirect("/discover");
  }

  const [teams, allAthletes, squadInvites] = await Promise.all([
    getCoachTeams(session.user.id),
    getAllAthletes(),
    getPendingCoachInvites(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg">
          Coach dashboard
        </h1>
        <p className="mt-1 font-body text-sm text-fg-muted">
          Manage your teams and rosters, {session.user.name}.
        </p>
      </div>

      <SquadInvites invites={squadInvites} />

      <div className="mb-10">
        <CreateTeamForm />
      </div>

      {teams.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong p-10 text-center">
          <p className="font-body text-sm text-fg-muted">
            No teams yet — create your first team above.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {teams.map((team) => {
            const memberHandles = new Set(team.members.map((m) => m.handle));
            const candidates = allAthletes
              .filter((a) => !memberHandles.has(a.handle))
              .map((a) => ({ handle: a.handle, name: a.name }));

            const activeCount = team.members.filter((m) => m.status === "active").length;
            const pendingCount = team.members.length - activeCount;

            return (
              <div
                key={team.id}
                className="rounded-lg border border-line bg-surface-raised p-5"
              >
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl font-bold uppercase tracking-wide text-fg">
                      {team.name}
                    </h2>
                    <p className="font-data text-[11px] uppercase tracking-wide text-fg-faint">
                      {team.sportLabel}
                      {team.ageGroup ? ` · ${team.ageGroup}` : ""} · {activeCount}{" "}
                      {activeCount === 1 ? "athlete" : "athletes"}
                      {pendingCount > 0
                        ? ` · ${pendingCount} pending invite${pendingCount === 1 ? "" : "s"}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Link
                      href={`/coach/teams/${team.id}/dashboard`}
                      className="font-body text-sm font-semibold hover:underline"
                      style={{ color: "var(--color-accent)" }}
                    >
                      Team dashboard →
                    </Link>
                    <Link
                      href={`/teams/${team.slug}`}
                      className="font-body text-sm font-medium text-fg-muted hover:text-fg"
                    >
                      Public page →
                    </Link>
                  </div>
                </div>

                {team.members.length > 0 && (
                  <ul className="mb-4 flex flex-col gap-2">
                    {team.members.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between rounded-md border border-line px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-body text-sm font-semibold text-fg">
                            {m.name}
                          </span>
                          <span className="font-body text-[12.5px] text-fg-muted">
                            {m.position}
                          </span>
                          {m.status === "pending" && (
                            <span className="rounded-full bg-surface-sunken px-2 py-0.5 font-data text-[10px] uppercase tracking-wide text-fg-faint">
                              Pending
                            </span>
                          )}
                        </div>
                        <form action={removeTeamMemberAction}>
                          <input type="hidden" name="teamId" value={team.id} />
                          <input type="hidden" name="athleteId" value={m.id} />
                          <button
                            type="submit"
                            className="font-body text-[12.5px] font-medium text-fg-muted hover:text-[var(--color-bad)]"
                          >
                            {m.status === "pending" ? "Cancel invite" : "Remove"}
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}

                <AddMemberForm teamId={team.id} candidates={candidates} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
