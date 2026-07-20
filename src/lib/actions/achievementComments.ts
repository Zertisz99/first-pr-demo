"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notifyUsers } from "@/lib/notifications";

export type ActionState = { error?: string } | undefined;

export async function addAchievementCommentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { error: "You need to be logged in to comment." };

  const achievementId = String(formData.get("achievementId") ?? "");
  const athleteHandle = String(formData.get("athleteHandle") ?? "");
  const comment = String(formData.get("comment") ?? "").trim();
  if (!achievementId) return { error: "Achievement not found." };
  if (!comment) return { error: "Write a comment." };

  const achievement = await prisma.achievement.findUnique({
    where: { id: achievementId },
    include: { athlete: { select: { userId: true, handle: true } } },
  });
  if (!achievement) return { error: "Achievement not found." };

  await prisma.achievementComment.create({
    data: { achievementId, userId: session.user.id, comment },
  });

  if (achievement.athlete.userId && achievement.athlete.userId !== session.user.id) {
    await notifyUsers(
      [achievement.athlete.userId],
      "achievement_comment",
      `${session.user.name ?? "Someone"} commented on your achievement "${achievement.title}".`,
      {
        senderId: session.user.id,
        link: `/athletes/${achievement.athlete.handle}`,
      }
    );
  }

  if (athleteHandle) revalidatePath(`/athletes/${athleteHandle}`);
}
