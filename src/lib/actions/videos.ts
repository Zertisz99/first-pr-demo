"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notifyUsers } from "@/lib/notifications";
import type { VideoVisibility } from "@/generated/prisma/client";

export type ActionState = { error?: string } | undefined;

async function requireCoachTeam(teamId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "coach") return null;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.coachId !== session.user.id) return null;

  return { team, coachId: session.user.id };
}

const VISIBILITIES: VideoVisibility[] = ["public", "team_only", "private"];

export async function uploadVideoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = String(formData.get("teamId") ?? "");
  const auth_ = await requireCoachTeam(teamId);
  if (!auth_) return { error: "That team doesn't belong to you." };

  const title = String(formData.get("title") ?? "").trim();
  const storageUrl = String(formData.get("storageUrl") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const matchId = String(formData.get("matchId") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "team_only");
  const tagsRaw = String(formData.get("tags") ?? "").trim();

  if (!title) return { error: "Give the video a title." };
  if (!storageUrl) return { error: "Enter a video URL." };
  if (!VISIBILITIES.includes(visibility as VideoVisibility)) {
    return { error: "Choose a valid visibility." };
  }

  if (matchId) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match || match.teamId !== teamId) return { error: "Match not found." };
  }

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  await prisma.video.create({
    data: {
      teamId,
      matchId: matchId || null,
      uploadedById: auth_.coachId,
      title,
      description: description || null,
      storageUrl,
      tags,
      visibility: visibility as VideoVisibility,
    },
  });

  revalidatePath(`/coach/teams/${teamId}/videos`);
}

export async function tagAthleteAction(formData: FormData): Promise<void> {
  const teamId = String(formData.get("teamId") ?? "");
  const auth_ = await requireCoachTeam(teamId);
  if (!auth_) return;

  const videoId = String(formData.get("videoId") ?? "");
  const athleteId = String(formData.get("athleteId") ?? "");

  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video || video.teamId !== teamId) return;

  const member = await prisma.teamMember.findFirst({
    where: { teamId, athleteId, status: "active" },
  });
  if (!member) return;

  try {
    await prisma.videoAthleteTag.create({ data: { videoId, athleteId } });
  } catch {
    // already tagged — ignore
  }

  revalidatePath(`/coach/teams/${teamId}/videos`);
}

export async function untagAthleteAction(formData: FormData): Promise<void> {
  const teamId = String(formData.get("teamId") ?? "");
  const auth_ = await requireCoachTeam(teamId);
  if (!auth_) return;

  const videoId = String(formData.get("videoId") ?? "");
  const athleteId = String(formData.get("athleteId") ?? "");

  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video || video.teamId !== teamId) return;

  await prisma.videoAthleteTag.deleteMany({ where: { videoId, athleteId } });
  revalidatePath(`/coach/teams/${teamId}/videos`);
}

export async function addVideoCommentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = String(formData.get("teamId") ?? "");
  const auth_ = await requireCoachTeam(teamId);
  if (!auth_) return { error: "That team doesn't belong to you." };

  const videoId = String(formData.get("videoId") ?? "");
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video || video.teamId !== teamId) return { error: "Video not found." };

  const comment = String(formData.get("comment") ?? "").trim();
  if (!comment) return { error: "Write a comment." };

  const timestampRaw = String(formData.get("timestampSeconds") ?? "").trim();
  const timestampSeconds = timestampRaw ? Number(timestampRaw) : null;
  if (timestampRaw && (!Number.isFinite(timestampSeconds) || timestampSeconds! < 0)) {
    return { error: "Enter a valid timestamp in seconds." };
  }

  await prisma.videoComment.create({
    data: {
      videoId,
      userId: auth_.coachId,
      comment,
      timestampSeconds,
    },
  });

  const tags = await prisma.videoAthleteTag.findMany({
    where: { videoId },
    include: { athlete: { select: { userId: true } } },
  });
  const recipientIds = tags
    .map((t) => t.athlete.userId)
    .filter((id): id is string => !!id && id !== auth_.coachId);
  await notifyUsers(
    recipientIds,
    "video_comment",
    `New comment on "${video.title}"`,
    `/coach/teams/${teamId}/videos`
  );

  revalidatePath(`/coach/teams/${teamId}/videos`);
}

export async function deleteVideoAction(formData: FormData): Promise<void> {
  const teamId = String(formData.get("teamId") ?? "");
  const auth_ = await requireCoachTeam(teamId);
  if (!auth_) return;

  const videoId = String(formData.get("videoId") ?? "");
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video || video.teamId !== teamId) return;

  await prisma.video.delete({ where: { id: videoId } });
  revalidatePath(`/coach/teams/${teamId}/videos`);
}
