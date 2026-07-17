import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageTeam } from "@/lib/teams";
import { SPORT_LABELS, ROLE_LABELS } from "@/lib/sports";
import { getTeamMatches } from "@/lib/matches";
import { getSeasonRecord } from "@/lib/season";
import { deleteMatchAction } from "@/lib/actions/matches";
import CreateMatchForm from "@/components/coach/CreateMatchForm";
import FormationForm from "@/components/coach/FormationForm";
import ResultForm from "@/components/coach/ResultForm";
import LineupRow from "@/components/coach/LineupRow";

export default async function TeamMatchesPage(
  props: PageProps<"/coach/teams/[teamId]/matches">
) {
  const { teamId } = await props.params;
  const session = await auth();
  if (!session?.user || !["coach", "club"].includes(session.user.role)) {
    redirect("/discover");
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();
  if (!(await canManageTeam(team, session.user.id))) redirect("/coach");

  const matches = await getTeamMatches(teamId);
  const seasonRecord = await getSeasonRecord(teamId);
  const roleLabels = ROLE_LABELS[team.sport];

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
          {SPORT_LABELS[team.sport]} · matches &amp; team sheets
        </p>
      </div>

      {seasonRecord.played > 0 && (
        <div className="mb-6 flex flex-wrap gap-6 rounded-lg border border-line bg-surface-raised p-4">
          <div>
            <p className="font-data text-[10px] uppercase tracking-wide text-fg-faint">Played</p>
            <p className="font-display text-xl font-bold text-fg">{seasonRecord.played}</p>
          </div>
          <div>
            <p className="font-data text-[10px] uppercase tracking-wide text-fg-faint">Won</p>
            <p className="font-display text-xl font-bold text-fg">{seasonRecord.won}</p>
          </div>
          <div>
            <p className="font-data text-[10px] uppercase tracking-wide text-fg-faint">Drawn</p>
            <p className="font-display text-xl font-bold text-fg">{seasonRecord.drawn}</p>
          </div>
          <div>
            <p className="font-data text-[10px] uppercase tracking-wide text-fg-faint">Lost</p>
            <p className="font-display text-xl font-bold text-fg">{seasonRecord.lost}</p>
          </div>
          <div>
            <p className="font-data text-[10px] uppercase tracking-wide text-fg-faint">Win %</p>
            <p className="font-display text-xl font-bold text-fg">{seasonRecord.winPercent}%</p>
          </div>
        </div>
      )}

      <div className="mb-10">
        <CreateMatchForm teamId={teamId} />
      </div>

      {matches.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong p-10 text-center">
          <p className="font-body text-sm text-fg-muted">
            No matches yet — schedule one above.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {matches.map((match) => {
            const starters = match.lineup.filter((l) => l.role === "starter");
            const bench = match.lineup.filter((l) => l.role === "bench");

            return (
              <div
                key={match.id}
                className="rounded-lg border border-line bg-surface-raised p-5"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl font-bold uppercase tracking-wide text-fg">
                      vs {match.opponent}
                    </h2>
                    <p className="font-data text-[11px] uppercase tracking-wide text-fg-faint">
                      {match.matchDate}
                      {match.venue ? ` · ${match.venue}` : ""}
                      {match.result ? ` · ${match.result}` : ""}
                    </p>
                  </div>
                  <form action={deleteMatchAction}>
                    <input type="hidden" name="teamId" value={teamId} />
                    <input type="hidden" name="matchId" value={match.id} />
                    <button
                      type="submit"
                      className="font-body text-[12.5px] font-medium text-fg-muted hover:text-[var(--color-bad)]"
                    >
                      Remove match
                    </button>
                  </form>
                </div>

                <div className="mb-4 flex flex-col gap-3">
                  <ResultForm
                    key={`${match.id}-${match.result ?? ""}-${match.outcome ?? ""}`}
                    teamId={teamId}
                    matchId={match.id}
                    result={match.result}
                    outcome={match.outcome}
                  />
                  {(team.sport === "football" || team.sport === "basketball") && (
                    <FormationForm
                      teamId={teamId}
                      matchId={match.id}
                      formation={match.formation}
                    />
                  )}
                </div>

                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-2 font-display uppercase tracking-wide text-[12px] text-fg-muted">
                      {roleLabels.starter} ({starters.length})
                    </h3>
                    {starters.length > 0 ? (
                      <ul className="flex flex-col gap-1">
                        {starters.map((l) => (
                          <li
                            key={l.athleteId}
                            className="font-body text-[13px] text-fg"
                          >
                            {l.athleteName}
                            {l.position ? ` — ${l.position}` : ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="font-body text-[12.5px] text-fg-faint">
                        No one selected yet.
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="mb-2 font-display uppercase tracking-wide text-[12px] text-fg-muted">
                      {roleLabels.bench} ({bench.length})
                    </h3>
                    {bench.length > 0 ? (
                      <ul className="flex flex-col gap-1">
                        {bench.map((l) => (
                          <li
                            key={l.athleteId}
                            className="font-body text-[13px] text-fg"
                          >
                            {l.athleteName}
                            {l.position ? ` — ${l.position}` : ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="font-body text-[12.5px] text-fg-faint">
                        No one selected yet.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-display uppercase tracking-wide text-[12px] text-fg-muted">
                    Roster
                  </h3>
                  <div className="flex flex-col gap-2">
                    {match.lineup.map((l) => (
                      <LineupRow
                        key={`${l.athleteId}-${l.role}-${l.position ?? ""}`}
                        teamId={teamId}
                        matchId={match.id}
                        athleteId={l.athleteId}
                        athleteName={l.athleteName}
                        defaultPosition={l.defaultPosition}
                        role={l.role}
                        position={l.position}
                        starterLabel={roleLabels.starter}
                        benchLabel={roleLabels.bench}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
