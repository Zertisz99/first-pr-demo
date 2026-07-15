import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { SPORT_LABELS } from "@/lib/sports";
import { getTeamRecoveryStatus } from "@/lib/team-recovery";

function readinessColor(score: number | null): string {
  if (score === null) return "var(--color-fg-faint)";
  if (score >= 70) return "var(--color-good)";
  if (score >= 50) return "var(--color-warning)";
  return "var(--color-bad)";
}

export default async function TeamRecoveryPage(
  props: PageProps<"/coach/teams/[teamId]/recovery">
) {
  const { teamId } = await props.params;
  const session = await auth();
  if (!session?.user || session.user.role !== "coach") {
    redirect("/discover");
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();
  if (team.coachId !== session.user.id) redirect("/coach");

  const statuses = await getTeamRecoveryStatus(teamId);
  const loggedCount = statuses.filter((s) => s.loggedToday).length;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <Link href="/coach" className="font-body text-[13px] text-fg-muted hover:text-fg">
        ← Coach dashboard
      </Link>

      <div className="mt-2 mb-8">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg">
          {team.name}
        </h1>
        <p className="mt-1 font-body text-sm text-fg-muted">
          {SPORT_LABELS[team.sport]} · recovery monitoring · {loggedCount}/{statuses.length}{" "}
          logged today
        </p>
      </div>

      {statuses.length === 0 ? (
        <p className="font-body text-sm text-fg-faint">No active athletes on this team.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {statuses.map((s) => (
            <div
              key={s.athleteId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface-raised p-4"
            >
              <p className="font-body text-sm font-semibold text-fg">{s.athleteName}</p>
              {s.loggedToday ? (
                <div className="flex items-center gap-5 font-data text-[12.5px]">
                  <span>
                    <span className="text-fg-faint">Readiness </span>
                    <span
                      className="font-semibold tabular-nums"
                      style={{ color: readinessColor(s.readinessScore) }}
                    >
                      {s.readinessScore}
                    </span>
                  </span>
                  <span>
                    <span className="text-fg-faint">Sleep </span>
                    <span className="font-semibold tabular-nums text-fg">{s.sleepHours}h</span>
                  </span>
                  <span>
                    <span className="text-fg-faint">Fatigue </span>
                    <span className="font-semibold tabular-nums text-fg">
                      {s.fatigueScore}/10
                    </span>
                  </span>
                </div>
              ) : (
                <span
                  className="rounded-full px-2.5 py-1 font-data text-[10.5px] uppercase tracking-wide"
                  style={{ border: "1px solid var(--color-line-strong)", color: "var(--color-fg-faint)" }}
                >
                  Not logged today
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
