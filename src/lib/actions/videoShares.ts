"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notifyUsers } from "@/lib/notifications";

export async function shareVideoAction(
  videoId: string
): Promise<{ count: number } | { error: string }> {
  const session = await auth();
  if (!session?.user) return { error: "You need to be logged in to share." };

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: { athlete: { select: { userId: true, handle: true } } },
  });
  if (!video) return { error: "Video not found." };

  await prisma.videoShare.create({
    data: { videoId, userId: session.user.id },
  });

  if (video.athlete?.userId && video.athlete.userId !== session.user.id) {
    await notifyUsers(
      [video.athlete.userId],
      "video_shared",
      `${session.user.name ?? "Someone"} shared your video "${video.title}".`,
      {
        senderId: session.user.id,
        link: `/athletes/${video.athlete.handle}`,
      }
    );
  }

  const count = await prisma.videoShare.count({ where: { videoId } });
  return { count };
}
