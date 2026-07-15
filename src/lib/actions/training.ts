"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { dateOnly } from "@/lib/training";
import { notifyUsers } from "@/lib/notifications";

export type ActionState = { error?: string } | undefined;

async function requireCoachTeam(teamId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "coach") return null;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.coachId !== session.user.id) return null;

  return team;
}

export async function createTrainingPlanAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = String(formData.get("teamId") ?? "");
  const team = await requireCoachTeam(teamId);
  if (!team) return { error: "That team doesn't belong to you." };

  const weekStartStr = String(formData.get("weekStart") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!weekStartStr) return { error: "Choose a week start date." };
  if (!title) return { error: "Give the plan a title." };

  await prisma.trainingPlan.create({
    data: { teamId, createdBy: team.coachId, weekStart: dateOnly(weekStartStr), title },
  });

  revalidatePath(`/coach/teams/${teamId}/planner`);
}

export async function addTrainingSessionAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = String(formData.get("teamId") ?? "");
  const team = await requireCoachTeam(teamId);
  if (!team) return { error: "That team doesn't belong to you." };

  const planId = String(formData.get("planId") ?? "");
  const plan = await prisma.trainingPlan.findUnique({ where: { id: planId } });
  if (!plan || plan.teamId !== teamId) return { error: "Plan not found." };

  const sessionDate = String(formData.get("sessionDate") ?? "");
  const sessionType = String(formData.get("sessionType") ?? "").trim();
  const intensityLabel = String(formData.get("intensityLabel") ?? "").trim();
  const durationMin = Number(formData.get("durationMin"));
  const notes = String(formData.get("notes") ?? "").trim();

  if (!sessionDate) return { error: "Choose a session date." };
  if (!sessionType) return { error: "Choose a session type." };
  if (!intensityLabel) return { error: "Choose an intensity." };
  if (!Number.isFinite(durationMin) || durationMin <= 0) {
    return { error: "Enter a valid duration." };
  }

  await prisma.trainingSession.create({
    data: {
      planId,
      sessionDate: dateOnly(sessionDate),
      sessionType,
      intensityLabel,
      durationMin: Math.round(durationMin),
      notes: notes || null,
    },
  });

  const members = await prisma.teamMember.findMany({
    where: { teamId, status: "active" },
    include: { athlete: { select: { userId: true } } },
  });
  const recipientIds = members
    .map((m) => m.athlete.userId)
    .filter((id): id is string => !!id);
  await notifyUsers(
    recipientIds,
    "training_session_added",
    `New ${sessionType.toLowerCase()} session added to ${plan.title}`
  );

  revalidatePath(`/coach/teams/${teamId}/planner`);
}

export async function setSessionCompletionAction(formData: FormData): Promise<void> {
  const teamId = String(formData.get("teamId") ?? "");
  const team = await requireCoachTeam(teamId);
  if (!team) return;

  const sessionId = String(formData.get("sessionId") ?? "");
  const athleteId = String(formData.get("athleteId") ?? "");
  const completed = String(formData.get("completed") ?? "") === "true";

  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    include: { plan: true },
  });
  if (!session || session.plan.teamId !== teamId) return;

  const member = await prisma.teamMember.findFirst({
    where: { teamId, athleteId, status: "active" },
  });
  if (!member) return;

  await prisma.sessionLog.upsert({
    where: { sessionId_athleteId: { sessionId, athleteId } },
    update: { completed },
    create: { sessionId, athleteId, completed },
  });

  revalidatePath(`/coach/teams/${teamId}/planner`);
}

export async function deleteTrainingSessionAction(formData: FormData): Promise<void> {
  const teamId = String(formData.get("teamId") ?? "");
  const team = await requireCoachTeam(teamId);
  if (!team) return;

  const sessionId = String(formData.get("sessionId") ?? "");
  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    include: { plan: true },
  });
  if (!session || session.plan.teamId !== teamId) return;

  await prisma.trainingSession.delete({ where: { id: sessionId } });
  revalidatePath(`/coach/teams/${teamId}/planner`);
}
