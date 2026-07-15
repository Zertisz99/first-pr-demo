"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { InjuryStatus } from "@/generated/prisma/client";

export type ActionState = { error?: string } | undefined;

const STATUSES: InjuryStatus[] = ["active", "recovering", "cleared"];

async function requireCoachTeamMember(teamId: string, athleteId: string) {
  const session = await auth();
  if (!session?.user || !["coach", "club"].includes(session.user.role)) return null;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.coachId !== session.user.id) return null;

  const member = await prisma.teamMember.findFirst({
    where: { teamId, athleteId, status: "active" },
  });
  if (!member) return null;

  return team;
}

export async function createInjuryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = String(formData.get("teamId") ?? "");
  const athleteId = String(formData.get("athleteId") ?? "");
  const team = await requireCoachTeamMember(teamId, athleteId);
  if (!team) return { error: "That athlete isn't on your team." };

  const injuryType = String(formData.get("injuryType") ?? "").trim();
  const reportedDateStr = String(formData.get("reportedDate") ?? "");
  const expectedReturnStr = String(formData.get("expectedReturnDate") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!injuryType) return { error: "Describe the injury." };
  if (!reportedDateStr) return { error: "Choose the reported date." };

  await prisma.injury.create({
    data: {
      athleteId,
      injuryType,
      reportedDate: new Date(`${reportedDateStr}T00:00:00.000Z`),
      expectedReturnDate: expectedReturnStr
        ? new Date(`${expectedReturnStr}T00:00:00.000Z`)
        : null,
      notes: notes || null,
    },
  });

  revalidatePath(`/coach/teams/${teamId}/injuries`);
}

export async function updateInjuryStatusAction(formData: FormData): Promise<void> {
  const teamId = String(formData.get("teamId") ?? "");
  const athleteId = String(formData.get("athleteId") ?? "");
  const team = await requireCoachTeamMember(teamId, athleteId);
  if (!team) return;

  const injuryId = String(formData.get("injuryId") ?? "");
  const injury = await prisma.injury.findUnique({ where: { id: injuryId } });
  if (!injury || injury.athleteId !== athleteId) return;

  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as InjuryStatus)) return;

  await prisma.injury.update({
    where: { id: injuryId },
    data: { status: status as InjuryStatus },
  });

  revalidatePath(`/coach/teams/${teamId}/injuries`);
}

export async function deleteInjuryAction(formData: FormData): Promise<void> {
  const teamId = String(formData.get("teamId") ?? "");
  const athleteId = String(formData.get("athleteId") ?? "");
  const team = await requireCoachTeamMember(teamId, athleteId);
  if (!team) return;

  const injuryId = String(formData.get("injuryId") ?? "");
  const injury = await prisma.injury.findUnique({ where: { id: injuryId } });
  if (!injury || injury.athleteId !== athleteId) return;

  await prisma.injury.delete({ where: { id: injuryId } });
  revalidatePath(`/coach/teams/${teamId}/injuries`);
}
