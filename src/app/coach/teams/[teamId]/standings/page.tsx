import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageTeam } from "@/lib/teams";
import { SPORT_LABELS } from "@/lib/sports";
import { getLeagueStandings } from "@/lib/standings";
import AddStandingRowForm from "@/components/coach/AddStandingRowForm";
import StandingRowEdit from "@/components/coach/StandingRowEdit";

export default async function TeamStandingsPage(
  props: PageProps<"/coach/teams/[teamId]/standings">
) {
  const { teamId } = await props.params;
  const session = await auth();
  if (!session?.user || !["coach", "club"].includes(session.user.role)) {
    redirect("/discover");
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();
  if (!(await canManageTeam(team, session.user.id))) redirect("/coach");

  const rows = await getLeagueStandings(teamId);

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
          {SPORT_LABELS[team.sport]} · league table
        </p>
        <p className="mt-2 max-w-[60ch] font-body text-[12.5px] text-fg-faint">
          Manually entered from your league&rsquo;s official standings — not auto-computed
          from match results, since opponents may not be on Athleticore.
        </p>
      </div>

      <div className="mb-8 rounded-lg border border-line bg-surface-raised p-4">
        <h3 className="mb-3 font-display uppercase tracking-wide text-[13px] text-fg-muted">
          Add a row
        </h3>
        <AddStandingRowForm teamId={teamId} />
      </div>

      {rows.length === 0 ? (
        <p className="font-body text-sm text-fg-faint">No standings entered yet.</p>
      ) : (
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <StandingRowEdit key={`${row.id}-${row.points}`} teamId={teamId} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
