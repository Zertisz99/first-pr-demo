import { prisma } from "@/lib/db";
import type { VideoVisibility } from "@/generated/prisma/client";

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export type VideoComment = {
  id: string;
  authorName: string;
  comment: string;
  timestampSeconds: number | null;
  createdAt: string;
};

export type VideoEntry = {
  id: string;
  title: string;
  description: string | null;
  storageUrl: string;
  thumbnailUrl: string | null;
  tags: string[];
  visibility: VideoVisibility;
  matchOpponent: string | null;
  createdAt: string;
  taggedAthletes: { athleteId: string; athleteName: string }[];
  comments: VideoComment[];
};

export async function getTeamVideos(teamId: string): Promise<VideoEntry[]> {
  const videos = await prisma.video.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
    include: {
      match: { select: { opponent: true } },
      athleteTags: { include: { athlete: { select: { id: true, name: true } } } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  return videos.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    storageUrl: v.storageUrl,
    thumbnailUrl: v.thumbnailUrl,
    tags: v.tags,
    visibility: v.visibility,
    matchOpponent: v.match?.opponent ?? null,
    createdAt: toDateKey(v.createdAt),
    taggedAthletes: v.athleteTags.map((t) => ({
      athleteId: t.athlete.id,
      athleteName: t.athlete.name,
    })),
    comments: v.comments.map((c) => ({
      id: c.id,
      authorName: c.user.name,
      comment: c.comment,
      timestampSeconds: c.timestampSeconds,
      createdAt: toDateKey(c.createdAt),
    })),
  }));
}

export type AthleteVideoEntry = {
  id: string;
  title: string;
  description: string | null;
  storageUrl: string;
  thumbnailUrl: string | null;
  tags: string[];
  visibility: VideoVisibility;
  isHighlight: boolean;
  createdAt: string;
};

export async function getAthleteVideos(athleteId: string): Promise<AthleteVideoEntry[]> {
  const videos = await prisma.video.findMany({
    where: { athleteId },
    orderBy: { createdAt: "desc" },
  });

  return videos.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    storageUrl: v.storageUrl,
    thumbnailUrl: v.thumbnailUrl,
    tags: v.tags,
    visibility: v.visibility,
    isHighlight: v.isHighlight,
    createdAt: toDateKey(v.createdAt),
  }));
}

export type PublicHighlight = {
  id: string;
  title: string;
  description: string | null;
  storageUrl: string;
  thumbnailUrl: string | null;
  tags: string[];
  createdAt: string;
};

export async function getPublicHighlights(athleteHandle: string): Promise<PublicHighlight[]> {
  const videos = await prisma.video.findMany({
    where: {
      isHighlight: true,
      visibility: "public",
      athlete: { handle: athleteHandle },
    },
    orderBy: { createdAt: "desc" },
  });

  return videos.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    storageUrl: v.storageUrl,
    thumbnailUrl: v.thumbnailUrl,
    tags: v.tags,
    createdAt: toDateKey(v.createdAt),
  }));
}

export async function getPublicTeamVideos(teamId: string): Promise<PublicHighlight[]> {
  const videos = await prisma.video.findMany({
    where: { teamId, visibility: "public" },
    orderBy: { createdAt: "desc" },
  });

  return videos.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    storageUrl: v.storageUrl,
    thumbnailUrl: v.thumbnailUrl,
    tags: v.tags,
    createdAt: toDateKey(v.createdAt),
  }));
}
