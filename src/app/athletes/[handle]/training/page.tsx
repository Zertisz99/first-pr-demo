import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getTeamPlans } from "@/lib/training";
import { auth } from "@/auth";
import SportTheme from "@/components/SportTheme";

export default async function AthleteTrainingPage(
  props: PageProps<"/athletes/[handle]/training">
) {
  const { handle } = await props.params;
  const [athlete, session] = await Promise.all([
    prisma.athlete.findUnique({ where: { handle }, select: { id: true, userId: true, sport: true } }),
    auth(),
  ]);

  if (!athlete) notFound();
  if (!session?.user || session.user.id !== athlete.userId) {
    redirect(`/athletes/${handle}`);
  }

  const membership = await prisma.teamMember.findFirst({
    where: { athleteId: athlete.id, status: "active" },
    select: { team: { select: { id: true, name: true } } },
  });

  const plans = membership ? await getTeamPlans(membership.team.id) : [];

  return (
    <SportTheme sport={athlete.sport}>
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <Link
          href={`/athletes/${handle}/dashboard`}
          className="font-body text-[13px] text-fg-muted hover:text-fg"
        >
          ← Dashboard
        </Link>

        <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-fg">
          Training plan
        </h1>
        <p className="mt-1 mb-8 font-body text-sm text-fg-muted">
          {membership ? membership.team.name : "You're not on a team yet."}
        </p>

        {plans.length === 0 ? (
          <p className="font-body text-sm text-fg-faint">
            No training plans have been published yet.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-lg border border-line bg-surface-raised p-5"
              >
                <h2 className="font-display text-lg font-bold uppercase tracking-wide text-fg">
                  {plan.title}
                </h2>
                <p className="mb-3 font-data text-[11px] uppercase tracking-wide text-fg-faint">
                  Week of {plan.weekStart}
                </p>
                <div className="flex flex-col gap-2">
                  {plan.sessions.map((s) => {
                    const mine = s.completions.find((c) => c.athleteId === athlete.id);
                    return (
                      <div
                        key={s.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line px-3 py-2"
                      >
                        <div>
                          <span className="font-body text-sm font-semibold text-fg">
                            {s.sessionType}
                          </span>
                          <span className="ml-2 font-body text-[12.5px] text-fg-muted">
                            {s.date} · {s.intensityLabel} · {s.durationMin} min
                          </span>
                        </div>
                        {mine?.completed && (
                          <span
                            className="rounded-full px-2 py-0.5 font-data text-[10px] uppercase tracking-wide"
                            style={{
                              background: "var(--color-accent)",
                              color: "var(--color-accent-fg)",
                            }}
                          >
                            Completed
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SportTheme>
  );
}
