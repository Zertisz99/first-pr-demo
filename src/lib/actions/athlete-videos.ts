"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { VideoVisibility } from "@/generated/prisma/client";

export type ActionState = { error?: string } | undefined;

const VISIBILITIES: VideoVisibility[] = ["public", "team_only", "private"];

async function requireOwnAthlete(handle: string) {
  const session = await auth();
  if (!session?.user) return null;

  const athlete = await prisma.athlete.findUnique({ where: { handle } });
  if (!athlete || athlete.userId !== session.user.id) return null;

  return athlete;
}

export async function uploadAthleteVideoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const handle = String(formData.get("handle") ?? "");
  const athlete = await requireOwnAthlete(handle);
  if (!athlete) return { error: "You can only upload videos to your own profile." };

  const title = String(formData.get("title") ?? "").trim();
  const storageUrl = String(formData.get("storageUrl") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "private");
  const tagsRaw = String(formData.get("tags") ?? "").trim();

  if (!title) return { error: "Give the video a title." };
  if (!storageUrl) return { error: "Enter a video URL." };
  if (!VISIBILITIES.includes(visibility as VideoVisibility)) {
    return { error: "Choose a valid visibility." };
  }

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  await prisma.video.create({
    data: {
      athleteId: athlete.id,
      uploadedById: athlete.userId!,
      title,
      description: description || null,
      storageUrl,
      tags,
      visibility: visibility as VideoVisibility,
    },
  });

  revalidatePath(`/athletes/${handle}/videos`);
}

export async function updateAthleteVideoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const handle = String(formData.get("handle") ?? "");
  const athlete = await requireOwnAthlete(handle);
  if (!athlete) return { error: "You can only edit your own videos." };

  const videoId = String(formData.get("videoId") ?? "");
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video || video.athleteId !== athlete.id) return { error: "Video not found." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "private");
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const isHighlight = formData.get("isHighlight") === "on";

  if (!title) return { error: "Give the video a title." };
  if (!VISIBILITIES.includes(visibility as VideoVisibility)) {
    return { error: "Choose a valid visibility." };
  }

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  await prisma.video.update({
    where: { id: videoId },
    data: {
      title,
      description: description || null,
      tags,
      visibility: visibility as VideoVisibility,
      isHighlight,
    },
  });

  revalidatePath(`/athletes/${handle}/videos`);
  revalidatePath(`/athletes/${handle}`);
}

export async function deleteAthleteVideoAction(formData: FormData): Promise<void> {
  const handle = String(formData.get("handle") ?? "");
  const athlete = await requireOwnAthlete(handle);
  if (!athlete) return;

  const videoId = String(formData.get("videoId") ?? "");
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video || video.athleteId !== athlete.id) return;

  await prisma.video.delete({ where: { id: videoId } });
  revalidatePath(`/athletes/${handle}/videos`);
  revalidatePath(`/athletes/${handle}`);
}
