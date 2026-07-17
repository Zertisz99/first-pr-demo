import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageTeam } from "@/lib/teams";
import { SPORT_LABELS } from "@/lib/sports";
import { getTeamPlans } from "@/lib/training";
import {
  setSessionCompletionAction,
  deleteTrainingSessionAction,
} from "@/lib/actions/training";
import CreateTrainingPlanForm from "@/components/coach/CreateTrainingPlanForm";
import AddTrainingSessionForm from "@/components/coach/AddTrainingSessionForm";

export default async function TeamPlannerPage(
  props: PageProps<"/coach/teams/[teamId]/planner">
) {
  const { teamId } = await props.params;
  const session = await auth();
  if (!session?.user || !["coach", "club"].includes(session.user.role)) {
    redirect("/discover");
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();
  if (!(await canManageTeam(team, session.user.id))) redirect("/coach");

  const plans = await getTeamPlans(teamId);

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
          {SPORT_LABELS[team.sport]} · weekly training planner
        </p>
      </div>

      <div className="mb-10">
        <CreateTrainingPlanForm teamId={teamId} />
      </div>

      {plans.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong p-10 text-center">
          <p className="font-body text-sm text-fg-muted">
            No plans yet — create this week&apos;s plan above.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-lg border border-line bg-surface-raised p-5"
            >
              <div className="mb-4">
                <h2 className="font-display text-xl font-bold uppercase tracking-wide text-fg">
                  {plan.title}
                </h2>
                <p className="font-data text-[11px] uppercase tracking-wide text-fg-faint">
                  Week of {plan.weekStart}
                </p>
              </div>

              {plan.sessions.length > 0 && (
                <div className="mb-4 flex flex-col gap-3">
                  {plan.sessions.map((s) => (
                    <div key={s.id} className="rounded-md border border-line p-3">
                      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <span className="font-body text-sm font-semibold text-fg">
                            {s.sessionType}
                          </span>
                          <span className="ml-2 font-body text-[12.5px] text-fg-muted">
                            {s.date} · {s.intensityLabel} · {s.durationMin} min
                          </span>
                        </div>
                        <form action={deleteTrainingSessionAction}>
                          <input type="hidden" name="teamId" value={teamId} />
                          <input type="hidden" name="sessionId" value={s.id} />
                          <button
                            type="submit"
                            className="font-body text-[12.5px] font-medium text-fg-muted hover:text-[var(--color-bad)]"
                          >
                            Remove
                          </button>
                        </form>
                      </div>
                      {s.notes && (
                        <p className="mb-2 font-body text-[13px] text-fg-muted">{s.notes}</p>
                      )}
                      {s.completions.length > 0 && (
                        <ul className="flex flex-wrap gap-2">
                          {s.completions.map((c) => (
                            <li key={c.athleteId}>
                              <form action={setSessionCompletionAction}>
                                <input type="hidden" name="teamId" value={teamId} />
                                <input type="hidden" name="sessionId" value={s.id} />
                                <input type="hidden" name="athleteId" value={c.athleteId} />
                                <input
                                  type="hidden"
                                  name="completed"
                                  value={c.completed ? "false" : "true"}
                                />
                                <button
                                  type="submit"
                                  className="rounded-full border px-2.5 py-1 font-body text-[12px]"
                                  style={
                                    c.completed
                                      ? {
                                          background: "var(--color-accent)",
                                          color: "var(--color-accent-fg)",
                                          borderColor: "var(--color-accent)",
                                        }
                                      : {
                                          borderColor: "var(--color-line-strong)",
                                          color: "var(--color-fg-muted)",
                                        }
                                  }
                                >
                                  {c.completed ? `✓ ${c.athleteName}` : c.athleteName}
                                </button>
                              </form>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <AddTrainingSessionForm teamId={teamId} planId={plan.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
