"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { StaffRole } from "@/generated/prisma/client";

export type ActionState = { error?: string } | undefined;

const ROLES: StaffRole[] = [
  "head_coach",
  "assistant_coach",
  "fitness_coach",
  "goalkeeper_coach",
  "physio",
  "analyst",
];

async function requireCoachTeam(teamId: string) {
  const session = await auth();
  if (!session?.user || !["coach", "club"].includes(session.user.role)) return null;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.coachId !== session.user.id) return null;

  return team;
}

export async function addStaffAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = String(formData.get("teamId") ?? "");
  const team = await requireCoachTeam(teamId);
  if (!team) return { error: "That team doesn't belong to you." };

  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  const email = String(formData.get("email") ?? "").trim();

  if (!name) return { error: "Enter a name." };
  if (!ROLES.includes(role as StaffRole)) return { error: "Choose a role." };

  await prisma.teamStaff.create({
    data: { teamId, name, role: role as StaffRole, email: email || null },
  });

  revalidatePath(`/coach/teams/${teamId}/staff`);
}

export async function deleteStaffAction(formData: FormData): Promise<void> {
  const teamId = String(formData.get("teamId") ?? "");
  const team = await requireCoachTeam(teamId);
  if (!team) return;

  const staffId = String(formData.get("staffId") ?? "");
  const staff = await prisma.teamStaff.findUnique({ where: { id: staffId } });
  if (!staff || staff.teamId !== teamId) return;

  await prisma.teamStaff.delete({ where: { id: staffId } });
  revalidatePath(`/coach/teams/${teamId}/staff`);
}
