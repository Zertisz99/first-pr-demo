import { prisma } from "@/lib/db";

export type AthleteGoal = {
  id: string;
  title: string;
  progressPercent: number;
};

export async function getAthleteGoals(athleteId: string): Promise<AthleteGoal[]> {
  const goals = await prisma.athleteGoal.findMany({
    where: { athleteId },
    orderBy: { createdAt: "asc" },
  });

  return goals.map((g) => ({
    id: g.id,
    title: g.title,
    progressPercent: g.progressPercent,
  }));
}
