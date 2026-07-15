import { prisma } from "@/lib/db";

export {
  SESSION_TYPES,
  INTENSITY_LABELS,
  type SessionType,
  type IntensityLabel,
} from "@/lib/training-constants";

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function dateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export type SessionCompletion = {
  athleteId: string;
  athleteName: string;
  completed: boolean;
  rpe: number | null;
  actualDurationMin: number | null;
};

export type TrainingSessionEntry = {
  id: string;
  date: string;
  sessionType: string;
  intensityLabel: string;
  durationMin: number;
  notes: string | null;
  completions: SessionCompletion[];
};

export type TrainingPlanEntry = {
  id: string;
  weekStart: string;
  title: string;
  sessions: TrainingSessionEntry[];
};

export async function getTeamPlans(teamId: string): Promise<TrainingPlanEntry[]> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        where: { status: "active" },
        include: { athlete: { select: { id: true, name: true } } },
        orderBy: { joinedAt: "asc" },
      },
      trainingPlans: {
        orderBy: { weekStart: "desc" },
        include: {
          sessions: {
            orderBy: { sessionDate: "asc" },
            include: { logs: true },
          },
        },
      },
    },
  });
  if (!team) return [];

  const roster = team.members.map((m) => ({ id: m.athlete.id, name: m.athlete.name }));

  return team.trainingPlans.map((plan) => ({
    id: plan.id,
    weekStart: toDateKey(plan.weekStart),
    title: plan.title,
    sessions: plan.sessions.map((session) => {
      const logsByAthlete = new Map(session.logs.map((l) => [l.athleteId, l]));
      return {
        id: session.id,
        date: toDateKey(session.sessionDate),
        sessionType: session.sessionType,
        intensityLabel: session.intensityLabel,
        durationMin: session.durationMin,
        notes: session.notes,
        completions: roster.map((r) => {
          const log = logsByAthlete.get(r.id);
          return {
            athleteId: r.id,
            athleteName: r.name,
            completed: log?.completed ?? false,
            rpe: log?.rpe ?? null,
            actualDurationMin: log?.actualDurationMin ?? null,
          };
        }),
      };
    }),
  }));
}
