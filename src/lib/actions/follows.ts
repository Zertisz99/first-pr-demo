"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notifyUsers } from "@/lib/notifications";

export async function followAthleteAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const athleteId = String(formData.get("athleteId") ?? "");
  const athleteHandle = String(formData.get("athleteHandle") ?? "");
  if (!athleteId) return;

  const athlete = await prisma.athlete.findUnique({ where: { id: athleteId } });
  if (!athlete || athlete.userId === session.user.id) return;

  try {
    await prisma.follow.create({
      data: { followerId: session.user.id, athleteId },
    });

    if (athlete.userId) {
      const followerAthlete = await prisma.athlete.findUnique({
        where: { userId: session.user.id },
        select: { handle: true },
      });
      await notifyUsers(
        [athlete.userId],
        "new_follower",
        `${session.user.name ?? "Someone"} started following you.`,
        {
          senderId: session.user.id,
          link: followerAthlete ? `/athletes/${followerAthlete.handle}` : undefined,
        }
      );
    }
  } catch {
    // already following — no-op
  }

  if (athleteHandle) revalidatePath(`/athletes/${athleteHandle}`);
}

export async function unfollowAthleteAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const athleteId = String(formData.get("athleteId") ?? "");
  const athleteHandle = String(formData.get("athleteHandle") ?? "");
  if (!athleteId) return;

  await prisma.follow.deleteMany({
    where: { followerId: session.user.id, athleteId },
  });

  if (athleteHandle) revalidatePath(`/athletes/${athleteHandle}`);
}
