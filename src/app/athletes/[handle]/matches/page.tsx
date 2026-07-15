import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getTeamMatches } from "@/lib/matches";
import { ROLE_LABELS } from "@/lib/sports";
import { auth } from "@/auth";
import SportTheme from "@/components/SportTheme";

export default async function AthleteMatchesPage(
  props: PageProps<"/athletes/[handle]/matches">
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
    select: { team: { select: { id: true, name: true, sport: true } } },
  });

  const matches = membership ? await getTeamMatches(membership.team.id) : [];
  const roleLabels = membership ? ROLE_LABELS[membership.team.sport] : null;

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
          Matches
        </h1>
        <p className="mt-1 mb-8 font-body text-sm text-fg-muted">
          {membership ? membership.team.name : "You're not on a team yet."}
        </p>

        {matches.length === 0 ? (
          <p className="font-body text-sm text-fg-faint">No matches scheduled yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {matches.map((match) => {
              const mine = match.lineup.find((l) => l.athleteId === athlete.id);
              return (
                <div
                  key={match.id}
                  className="rounded-lg border border-line bg-surface-raised p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-display text-lg font-bold uppercase tracking-wide text-fg">
                      vs {match.opponent}
                    </h2>
                    {mine && mine.role !== "none" && roleLabels && (
                      <span
                        className="rounded-full px-2 py-0.5 font-data text-[10px] uppercase tracking-wide"
                        style={{
                          background: "var(--color-accent)",
                          color: "var(--color-accent-fg)",
                        }}
                      >
                        {mine.role === "starter" ? roleLabels.starter : roleLabels.bench}
                        {mine.position ? ` · ${mine.position}` : ""}
                      </span>
                    )}
                  </div>
                  <p className="font-data text-[11px] uppercase tracking-wide text-fg-faint">
                    {match.matchDate}
                    {match.venue ? ` · ${match.venue}` : ""}
                    {match.result ? ` · ${match.result}` : ""}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SportTheme>
  );
}
