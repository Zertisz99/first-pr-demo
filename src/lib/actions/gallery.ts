"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export type ActionState = { error?: string } | undefined;

async function requireCoachTeam(teamId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "coach") return null;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.coachId !== session.user.id) return null;

  return { team, coachId: session.user.id };
}

export async function addPhotoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = String(formData.get("teamId") ?? "");
  const auth_ = await requireCoachTeam(teamId);
  if (!auth_) return { error: "That team doesn't belong to you." };

  const url = String(formData.get("url") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  if (!url) return { error: "Enter a photo URL." };

  await prisma.photo.create({
    data: { teamId, uploadedById: auth_.coachId, url, caption: caption || null },
  });

  revalidatePath(`/coach/teams/${teamId}/gallery`);
}

export async function deletePhotoAction(formData: FormData): Promise<void> {
  const teamId = String(formData.get("teamId") ?? "");
  const auth_ = await requireCoachTeam(teamId);
  if (!auth_) return;

  const photoId = String(formData.get("photoId") ?? "");
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo || photo.teamId !== teamId) return;

  await prisma.photo.delete({ where: { id: photoId } });
  revalidatePath(`/coach/teams/${teamId}/gallery`);
}
