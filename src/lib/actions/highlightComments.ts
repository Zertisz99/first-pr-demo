"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notifyUsers } from "@/lib/notifications";

export type ActionState = { error?: string } | undefined;

export async function addHighlightCommentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { error: "You need to be logged in to comment." };

  const highlightId = String(formData.get("highlightId") ?? "");
  const athleteHandle = String(formData.get("athleteHandle") ?? "");
  const comment = String(formData.get("comment") ?? "").trim();
  if (!highlightId) return { error: "Highlight not found." };
  if (!comment) return { error: "Write a comment." };

  const highlight = await prisma.highlightVideo.findUnique({
    where: { id: highlightId },
    include: { athlete: { select: { userId: true, handle: true } } },
  });
  if (!highlight) return { error: "Highlight not found." };

  await prisma.highlightComment.create({
    data: { highlightVideoId: highlightId, userId: session.user.id, comment },
  });

  if (highlight.athlete.userId && highlight.athlete.userId !== session.user.id) {
    await notifyUsers(
      [highlight.athlete.userId],
      "highlight_comment",
      `${session.user.name ?? "Someone"} commented on your highlight "${highlight.title}".`,
      {
        senderId: session.user.id,
        link: `/athletes/${highlight.athlete.handle}`,
      }
    );
  }

  if (athleteHandle) revalidatePath(`/athletes/${athleteHandle}`);
}
