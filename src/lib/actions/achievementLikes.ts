"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notifyUsers } from "@/lib/notifications";

export async function likeAchievementAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const achievementId = String(formData.get("achievementId") ?? "");
  const athleteHandle = String(formData.get("athleteHandle") ?? "");
  if (!achievementId) return;

  const achievement = await prisma.achievement.findUnique({
    where: { id: achievementId },
    include: { athlete: { select: { userId: true, handle: true } } },
  });
  if (!achievement) return;

  try {
    await prisma.achievementLike.create({
      data: { userId: session.user.id, achievementId },
    });

    if (achievement.athlete.userId && achievement.athlete.userId !== session.user.id) {
      await notifyUsers(
        [achievement.athlete.userId],
        "achievement_liked",
        `${session.user.name ?? "Someone"} liked your achievement "${achievement.title}".`,
        {
          senderId: session.user.id,
          link: `/athletes/${achievement.athlete.handle}`,
        }
      );
    }
  } catch {
    // already liked — no-op
  }

  if (athleteHandle) revalidatePath(`/athletes/${athleteHandle}`);
}

export async function unlikeAchievementAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const achievementId = String(formData.get("achievementId") ?? "");
  const athleteHandle = String(formData.get("athleteHandle") ?? "");
  if (!achievementId) return;

  await prisma.achievementLike.deleteMany({
    where: { userId: session.user.id, achievementId },
  });

  if (athleteHandle) revalidatePath(`/athletes/${athleteHandle}`);
}
