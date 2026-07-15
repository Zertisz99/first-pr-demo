"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notifyUsers } from "@/lib/notifications";
import type { AnnouncementCategory } from "@/generated/prisma/client";

export type ActionState = { error?: string } | undefined;

const CATEGORIES: AnnouncementCategory[] = ["general", "training_change", "match_update", "event"];

async function requireCoachTeam(teamId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "coach") return null;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.coachId !== session.user.id) return null;

  return { team, coachId: session.user.id };
}

export async function createAnnouncementAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = String(formData.get("teamId") ?? "");
  const auth_ = await requireCoachTeam(teamId);
  if (!auth_) return { error: "That team doesn't belong to you." };

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const category = String(formData.get("category") ?? "general");

  if (!title) return { error: "Give the announcement a title." };
  if (!body) return { error: "Write the announcement body." };
  if (!CATEGORIES.includes(category as AnnouncementCategory)) {
    return { error: "Choose a valid category." };
  }

  await prisma.announcement.create({
    data: {
      teamId,
      authorId: auth_.coachId,
      category: category as AnnouncementCategory,
      title,
      body,
    },
  });

  const members = await prisma.teamMember.findMany({
    where: { teamId, status: "active" },
    include: { athlete: { select: { userId: true } } },
  });
  const recipientIds = members
    .map((m) => m.athlete.userId)
    .filter((id): id is string => !!id);
  await notifyUsers(recipientIds, "team_announcement", `New team post: ${title}`);

  revalidatePath(`/coach/teams/${teamId}/announcements`);
}

export async function deleteAnnouncementAction(formData: FormData): Promise<void> {
  const teamId = String(formData.get("teamId") ?? "");
  const auth_ = await requireCoachTeam(teamId);
  if (!auth_) return;

  const announcementId = String(formData.get("announcementId") ?? "");
  const announcement = await prisma.announcement.findUnique({ where: { id: announcementId } });
  if (!announcement || announcement.teamId !== teamId) return;

  await prisma.announcement.delete({ where: { id: announcementId } });
  revalidatePath(`/coach/teams/${teamId}/announcements`);
}
