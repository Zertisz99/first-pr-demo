import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageTeam } from "@/lib/teams";
import { SPORT_LABELS } from "@/lib/sports";
import { getTeamRosterForComparison, getAthleteComparisonData } from "@/lib/comparison";

export default async function TeamComparePage(
  props: PageProps<"/coach/teams/[teamId]/compare">
) {
  const { teamId } = await props.params;
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user || !["coach", "club"].includes(session.user.role)) {
    redirect("/discover");
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();
  if (!(await canManageTeam(team, session.user.id))) redirect("/coach");

  const roster = await getTeamRosterForComparison(teamId);

  const rawSelected = searchParams.athletes;
  const selectedIds = (
    Array.isArray(rawSelected) ? rawSelected : rawSelected ? [rawSelected] : []
  ).filter((id) => roster.some((r) => r.id === id));

  const comparison = await getAthleteComparisonData(selectedIds);
  const allLabels = Array.from(
    new Set(comparison.flatMap((a) => a.headlineStats.map((s) => s.label)))
  );

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
          {SPORT_LABELS[team.sport]} · player comparison
        </p>
      </div>

      <form
        method="get"
        className="mb-8 flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-4"
      >
        <h3 className="font-display uppercase tracking-wide text-[13px] text-fg-muted">
          Select athletes to compare
        </h3>
        <div className="flex flex-wrap gap-3">
          {roster.map((r) => (
            <label
              key={r.id}
              className="flex items-center gap-1.5 font-body text-[13px] text-fg"
            >
              <input
                type="checkbox"
                name="athletes"
                value={r.id}
                defaultChecked={selectedIds.includes(r.id)}
                className="h-4 w-4"
              />
              {r.name}
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="self-start rounded-md px-4 py-2 font-body text-sm font-semibold"
          style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}
        >
          Compare
        </button>
      </form>

      {comparison.length < 2 ? (
        <p className="font-body text-sm text-fg-faint">
          Select at least 2 athletes to compare.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line bg-surface-raised">
                <th className="px-4 py-2.5 text-left font-data text-[11px] uppercase tracking-wide text-fg-faint">
                  Stat
                </th>
                {comparison.map((a) => (
                  <th
                    key={a.id}
                    className="px-4 py-2.5 text-right font-data text-[11px] uppercase tracking-wide text-fg-faint"
                  >
                    {a.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line">
                <td className="px-4 py-2.5 font-body text-[13px] text-fg-muted">Position</td>
                {comparison.map((a) => (
                  <td
                    key={a.id}
                    className="px-4 py-2.5 text-right font-body text-[13px] text-fg"
                  >
                    {a.position}
                  </td>
                ))}
              </tr>
              {allLabels.map((label, i) => (
                <tr
                  key={label}
                  className={i % 2 === 0 ? "bg-surface-raised" : ""}
                >
                  <td className="px-4 py-2.5 font-body text-[13px] text-fg-muted">{label}</td>
                  {comparison.map((a) => {
                    const stat = a.headlineStats.find((s) => s.label === label);
                    return (
                      <td
                        key={a.id}
                        className="px-4 py-2.5 text-right font-data text-sm font-semibold tabular-nums text-fg"
                      >
                        {stat?.value ?? "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
