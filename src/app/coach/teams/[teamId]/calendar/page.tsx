import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { SPORT_LABELS } from "@/lib/sports";
import { getTeamCalendarEvents } from "@/lib/calendar";
import MonthCalendar from "@/components/coach/MonthCalendar";

export default async function TeamCalendarPage(
  props: PageProps<"/coach/teams/[teamId]/calendar">
) {
  const { teamId } = await props.params;
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user || session.user.role !== "coach") {
    redirect("/discover");
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();
  if (team.coachId !== session.user.id) redirect("/coach");

  const now = new Date();
  const monthParam = typeof searchParams.month === "string" ? searchParams.month : "";
  const [yearStr, monthStr] = monthParam.split("-");
  const year = Number(yearStr) || now.getUTCFullYear();
  const month = monthStr ? Number(monthStr) - 1 : now.getUTCMonth();

  const monthStart = new Date(Date.UTC(year, month, 1));
  const monthEnd = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));
  const events = await getTeamCalendarEvents(teamId, monthStart, monthEnd);

  const prevMonth = new Date(Date.UTC(year, month - 1, 1));
  const nextMonth = new Date(Date.UTC(year, month + 1, 1));
  const monthLabel = monthStart.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <Link href="/coach" className="font-body text-[13px] text-fg-muted hover:text-fg">
        ← Coach dashboard
      </Link>

      <div className="mt-2 mb-8">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg">
          {team.name}
        </h1>
        <p className="mt-1 font-body text-sm text-fg-muted">
          {SPORT_LABELS[team.sport]} · team calendar
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/coach/teams/${teamId}/calendar?month=${prevMonth.getUTCFullYear()}-${String(prevMonth.getUTCMonth() + 1).padStart(2, "0")}`}
          className="font-body text-sm font-medium text-fg-muted hover:text-fg"
        >
          ← Prev
        </Link>
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-fg">
          {monthLabel}
        </h2>
        <Link
          href={`/coach/teams/${teamId}/calendar?month=${nextMonth.getUTCFullYear()}-${String(nextMonth.getUTCMonth() + 1).padStart(2, "0")}`}
          className="font-body text-sm font-medium text-fg-muted hover:text-fg"
        >
          Next →
        </Link>
      </div>

      <MonthCalendar year={year} month={month} events={events} />
    </div>
  );
}
