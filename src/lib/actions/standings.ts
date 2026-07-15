"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export type ActionState = { error?: string } | undefined;

async function requireCoachTeam(teamId: string) {
  const session = await auth();
  if (!session?.user || !["coach", "club"].includes(session.user.role)) return null;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.coachId !== session.user.id) return null;

  return team;
}

function toInt(value: FormDataEntryValue | null): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

export async function addStandingRowAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = String(formData.get("teamId") ?? "");
  const team = await requireCoachTeam(teamId);
  if (!team) return { error: "That team doesn't belong to you." };

  const teamName = String(formData.get("teamName") ?? "").trim();
  if (!teamName) return { error: "Enter a team name." };

  const rowCount = await prisma.leagueStanding.count({ where: { teamId } });

  await prisma.leagueStanding.create({
    data: {
      teamId,
      teamName,
      played: toInt(formData.get("played")),
      won: toInt(formData.get("won")),
      drawn: toInt(formData.get("drawn")),
      lost: toInt(formData.get("lost")),
      points: toInt(formData.get("points")),
      sortOrder: rowCount,
    },
  });

  revalidatePath(`/coach/teams/${teamId}/standings`);
}

export async function updateStandingRowAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = String(formData.get("teamId") ?? "");
  const team = await requireCoachTeam(teamId);
  if (!team) return { error: "That team doesn't belong to you." };

  const rowId = String(formData.get("rowId") ?? "");
  const row = await prisma.leagueStanding.findUnique({ where: { id: rowId } });
  if (!row || row.teamId !== teamId) return { error: "Row not found." };

  const teamName = String(formData.get("teamName") ?? "").trim();
  if (!teamName) return { error: "Enter a team name." };

  await prisma.leagueStanding.update({
    where: { id: rowId },
    data: {
      teamName,
      played: toInt(formData.get("played")),
      won: toInt(formData.get("won")),
      drawn: toInt(formData.get("drawn")),
      lost: toInt(formData.get("lost")),
      points: toInt(formData.get("points")),
    },
  });

  revalidatePath(`/coach/teams/${teamId}/standings`);
}

export async function deleteStandingRowAction(formData: FormData): Promise<void> {
  const teamId = String(formData.get("teamId") ?? "");
  const team = await requireCoachTeam(teamId);
  if (!team) return;

  const rowId = String(formData.get("rowId") ?? "");
  const row = await prisma.leagueStanding.findUnique({ where: { id: rowId } });
  if (!row || row.teamId !== teamId) return;

  await prisma.leagueStanding.delete({ where: { id: rowId } });
  revalidatePath(`/coach/teams/${teamId}/standings`);
}
