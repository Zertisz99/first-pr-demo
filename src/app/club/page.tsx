import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getClubByAdminId, getClubTeams } from "@/lib/clubs";
import { getAllAthletes } from "@/lib/athletes";
import { getSquadCoaches } from "@/lib/teams";
import { removeTeamMemberAction } from "@/lib/actions/team";
import { removeCoachAssignmentAction } from "@/lib/actions/coachAssignments";
import CreateSquadForm from "@/components/club/CreateSquadForm";
import AddMemberForm from "@/components/coach/AddMemberForm";
import InviteCoachForm from "@/components/club/InviteCoachForm";

export default async function ClubDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "club") {
    redirect("/discover");
  }

  const club = await getClubByAdminId(session.user.id);
  if (!club) redirect("/discover");

  const [squads, allAthletes] = await Promise.all([
    getClubTeams(club.id),
    getAllAthletes(),
  ]);

  const squadCoaches = await Promise.all(
    squads.map((squad) => getSquadCoaches(squad.id))
  );

  const initials = club.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold"
            style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}
          >
            {initials}
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg">
              {club.name}
            </h1>
            <p className="font-data text-[11px] uppercase tracking-wide text-fg-faint">
              {club.country === "Not set" ? "Location not set" : club.country}
              {club.city ? ` · ${club.city}` : ""}
              {club.foundedYear ? ` · Est. ${club.foundedYear}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/club/recruitment"
            className="rounded-md border border-line-strong px-4 py-2 font-body text-sm font-semibold text-fg"
          >
            Recruitment
          </Link>
          <Link
            href="/club/edit"
            className="rounded-md border border-line-strong px-4 py-2 font-body text-sm font-semibold text-fg"
          >
            Edit profile
          </Link>
        </div>
      </div>

      {club.description && (
        <p className="mb-8 font-body text-sm text-fg-muted">{club.description}</p>
      )}

      <div className="mb-10">
        <CreateSquadForm />
      </div>

      <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wide text-fg">
        Squads
      </h2>

      {squads.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong p-10 text-center">
          <p className="font-body text-sm text-fg-muted">
            No squads yet — create your first squad above.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {squads.map((squad, i) => {
            const coaches = squadCoaches[i];
            const memberHandles = new Set(squad.members.map((m) => m.handle));
            const candidates = allAthletes
              .filter((a) => !memberHandles.has(a.handle))
              .map((a) => ({ handle: a.handle, name: a.name }));

            const activeCount = squad.members.filter((m) => m.status === "active").length;
            const pendingCount = squad.members.length - activeCount;

            return (
              <div
                key={squad.id}
                className="rounded-lg border border-line bg-surface-raised p-5"
              >
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h3 className="font-display text-xl font-bold uppercase tracking-wide text-fg">
                      {squad.name}
                    </h3>
                    <p className="font-data text-[11px] uppercase tracking-wide text-fg-faint">
                      {squad.sportLabel}
                      {squad.ageGroup ? ` · ${squad.ageGroup}` : ""} · {activeCount}{" "}
                      {activeCount === 1 ? "athlete" : "athletes"}
                      {pendingCount > 0
                        ? ` · ${pendingCount} pending invite${pendingCount === 1 ? "" : "s"}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Link
                      href={`/coach/teams/${squad.id}/dashboard`}
                      className="font-body text-sm font-semibold hover:underline"
                      style={{ color: "var(--color-accent)" }}
                    >
                      Squad dashboard →
                    </Link>
                    <Link
                      href={`/teams/${squad.slug}`}
                      className="font-body text-sm font-medium text-fg-muted hover:text-fg"
                    >
                      Public page →
                    </Link>
                  </div>
                </div>

                {squad.members.length > 0 && (
                  <ul className="mb-4 flex flex-col gap-2">
                    {squad.members.map((m) => (
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
                          <input type="hidden" name="teamId" value={squad.id} />
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

                <AddMemberForm teamId={squad.id} candidates={candidates} />

                <div className="mt-5 border-t border-line pt-4">
                  <h4 className="mb-2 font-display uppercase tracking-wide text-[13px] text-fg-muted">
                    Coaches
                  </h4>
                  {coaches.length > 0 && (
                    <ul className="mb-3 flex flex-col gap-2">
                      {coaches.map((c) => (
                        <li
                          key={c.assignmentId}
                          className="flex items-center justify-between rounded-md border border-line px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-body text-sm font-semibold text-fg">
                              {c.name}
                            </span>
                            <span className="font-body text-[12.5px] text-fg-muted">
                              {c.email}
                            </span>
                            {c.status === "pending" && (
                              <span className="rounded-full bg-surface-sunken px-2 py-0.5 font-data text-[10px] uppercase tracking-wide text-fg-faint">
                                Pending
                              </span>
                            )}
                          </div>
                          <form action={removeCoachAssignmentAction}>
                            <input
                              type="hidden"
                              name="assignmentId"
                              value={c.assignmentId}
                            />
                            <button
                              type="submit"
                              className="font-body text-[12.5px] font-medium text-fg-muted hover:text-[var(--color-bad)]"
                            >
                              {c.status === "pending" ? "Cancel invite" : "Remove"}
                            </button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  )}
                  <InviteCoachForm teamId={squad.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
