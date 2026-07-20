"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notifyUsers } from "@/lib/notifications";

export async function likeHighlightAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const highlightId = String(formData.get("highlightId") ?? "");
  const athleteHandle = String(formData.get("athleteHandle") ?? "");
  if (!highlightId) return;

  const highlight = await prisma.highlightVideo.findUnique({
    where: { id: highlightId },
    include: { athlete: { select: { userId: true, handle: true } } },
  });
  if (!highlight) return;

  try {
    await prisma.highlightLike.create({
      data: { userId: session.user.id, highlightVideoId: highlightId },
    });

    if (highlight.athlete.userId && highlight.athlete.userId !== session.user.id) {
      await notifyUsers(
        [highlight.athlete.userId],
        "highlight_liked",
        `${session.user.name ?? "Someone"} liked your highlight "${highlight.title}".`,
        {
          senderId: session.user.id,
          link: `/athletes/${highlight.athlete.handle}`,
        }
      );
    }
  } catch {
    // already liked — no-op
  }

  if (athleteHandle) revalidatePath(`/athletes/${athleteHandle}`);
}

export async function unlikeHighlightAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const highlightId = String(formData.get("highlightId") ?? "");
  const athleteHandle = String(formData.get("athleteHandle") ?? "");
  if (!highlightId) return;

  await prisma.highlightLike.deleteMany({
    where: { userId: session.user.id, highlightVideoId: highlightId },
  });

  if (athleteHandle) revalidatePath(`/athletes/${athleteHandle}`);
}
