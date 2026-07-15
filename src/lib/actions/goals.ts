"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export type ActionState = { error?: string } | undefined;

async function requireOwnAthlete(handle: string) {
  const session = await auth();
  if (!session?.user) return null;

  const athlete = await prisma.athlete.findUnique({ where: { handle } });
  if (!athlete || athlete.userId !== session.user.id) return null;

  return athlete;
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export async function createGoalAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const handle = String(formData.get("handle") ?? "");
  const athlete = await requireOwnAthlete(handle);
  if (!athlete) return { error: "You can only manage your own goals." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Give the goal a title." };

  const progressPercent = clampPercent(Number(formData.get("progressPercent") ?? 0));

  await prisma.athleteGoal.create({
    data: { athleteId: athlete.id, title, progressPercent },
  });

  revalidatePath(`/athletes/${handle}/dashboard`);
}

export async function updateGoalAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const handle = String(formData.get("handle") ?? "");
  const athlete = await requireOwnAthlete(handle);
  if (!athlete) return { error: "You can only manage your own goals." };

  const goalId = String(formData.get("goalId") ?? "");
  const goal = await prisma.athleteGoal.findUnique({ where: { id: goalId } });
  if (!goal || goal.athleteId !== athlete.id) return { error: "Goal not found." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Give the goal a title." };

  const progressPercent = clampPercent(Number(formData.get("progressPercent") ?? 0));

  await prisma.athleteGoal.update({
    where: { id: goalId },
    data: { title, progressPercent },
  });

  revalidatePath(`/athletes/${handle}/dashboard`);
}

export async function deleteGoalAction(formData: FormData): Promise<void> {
  const handle = String(formData.get("handle") ?? "");
  const athlete = await requireOwnAthlete(handle);
  if (!athlete) return;

  const goalId = String(formData.get("goalId") ?? "");
  const goal = await prisma.athleteGoal.findUnique({ where: { id: goalId } });
  if (!goal || goal.athleteId !== athlete.id) return;

  await prisma.athleteGoal.delete({ where: { id: goalId } });
  revalidatePath(`/athletes/${handle}/dashboard`);
}
