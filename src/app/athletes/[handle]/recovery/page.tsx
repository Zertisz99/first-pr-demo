import { notFound, redirect } from "next/navigation";
import { getAthlete } from "@/lib/athletes";
import { getRecoveryHistory, getTodayEntry } from "@/lib/recovery";
import { SPORT_LIVE_ACCENT } from "@/lib/sports";
import { auth } from "@/auth";
import SportTheme from "@/components/SportTheme";
import ProgressionChart from "@/components/athlete/ProgressionChart";
import RecoveryLogForm from "@/components/recovery/RecoveryLogForm";
import AiCoachCard from "@/components/recovery/AiCoachCard";

export default async function RecoveryJournalPage(
  props: PageProps<"/athletes/[handle]/recovery">
) {
  const { handle } = await props.params;
  const [athlete, session] = await Promise.all([getAthlete(handle), auth()]);

  if (!athlete) notFound();
  if (!session?.user || session.user.id !== athlete.userId) {
    redirect(`/athletes/${handle}`);
  }

  const [history, today] = await Promise.all([
    getRecoveryHistory(handle),
    getTodayEntry(handle),
  ]);

  const trendPoints = history.map((entry) => ({
    label: entry.date.slice(5),
    value: entry.readinessScore,
  }));

  return (
    <SportTheme sport={athlete.sport}>
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg">
          Recovery journal
        </h1>
        <p className="mt-1 mb-8 font-body text-sm text-fg-muted">
          Daily check-ins build your wellness trend over time — only you can see this.
        </p>

        <div className="flex flex-col gap-8">
          <RecoveryLogForm athleteHandle={handle} today={today} />

          <div>
            <h2 className="mb-3 font-display uppercase tracking-wide text-[13px] text-fg-muted">
              Wellness trend
            </h2>
            {trendPoints.length > 0 ? (
              <ProgressionChart
                title="Readiness score"
                unit={`last ${trendPoints.length} check-ins`}
                points={trendPoints}
                accent={SPORT_LIVE_ACCENT}
              />
            ) : (
              <p className="font-body text-sm text-fg-faint">
                Log a few days in a row to see your trend.
              </p>
            )}
          </div>

          <AiCoachCard athleteHandle={handle} />

          {history.length > 0 && (
            <div>
              <h2 className="mb-3 font-display uppercase tracking-wide text-[13px] text-fg-muted">
                Recent history
              </h2>
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="px-4 py-2 text-left font-data text-[11px] uppercase tracking-wide text-fg-faint">
                        Date
                      </th>
                      <th className="px-4 py-2 text-right font-data text-[11px] uppercase tracking-wide text-fg-faint">
                        Readiness
                      </th>
                      <th className="px-4 py-2 text-right font-data text-[11px] uppercase tracking-wide text-fg-faint">
                        Sleep
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...history]
                      .reverse()
                      .slice(0, 10)
                      .map((entry, i) => (
                        <tr
                          key={entry.date}
                          className={i % 2 === 0 ? "bg-surface-raised" : ""}
                        >
                          <td className="px-4 py-2 font-body text-[13px] text-fg-muted">
                            {entry.date}
                          </td>
                          <td className="px-4 py-2 text-right font-data text-sm font-semibold tabular-nums text-fg">
                            {entry.readinessScore}
                          </td>
                          <td className="px-4 py-2 text-right font-data text-sm tabular-nums text-fg-muted">
                            {entry.sleepHours}h
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </SportTheme>
  );
}
