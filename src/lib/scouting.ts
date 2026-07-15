import { prisma } from "@/lib/db";
import { SPORT_LABELS } from "@/lib/sports";
import type { ContactRequestStatus, SportKey } from "@/generated/prisma/client";

export async function getWatchlistStatus(
  scoutUserId: string,
  athleteId: string
): Promise<boolean> {
  const row = await prisma.scoutWatchlist.findUnique({
    where: { scoutUserId_athleteId: { scoutUserId, athleteId } },
    select: { id: true },
  });
  return !!row;
}

export async function getPendingContactRequestStatus(
  scoutUserId: string,
  athleteId: string
): Promise<boolean> {
  const row = await prisma.scoutContactRequest.findFirst({
    where: { scoutUserId, athleteId, status: "pending" },
    select: { id: true },
  });
  return !!row;
}

export type WatchlistedAthlete = {
  athleteId: string;
  handle: string;
  name: string;
  sport: SportKey;
  sportLabel: string;
  position: string;
  notes: string | null;
};

export async function getClubWatchlist(scoutUserId: string): Promise<WatchlistedAthlete[]> {
  const rows = await prisma.scoutWatchlist.findMany({
    where: { scoutUserId },
    orderBy: { addedAt: "desc" },
    include: {
      athlete: { select: { id: true, handle: true, name: true, sport: true, position: true } },
    },
  });

  return rows.map((r) => ({
    athleteId: r.athlete.id,
    handle: r.athlete.handle,
    name: r.athlete.name,
    sport: r.athlete.sport,
    sportLabel: SPORT_LABELS[r.athlete.sport],
    position: r.athlete.position,
    notes: r.notes,
  }));
}

export type SentContactRequest = {
  id: string;
  handle: string;
  name: string;
  sportLabel: string;
  status: ContactRequestStatus;
  message: string;
  createdAt: string;
};

export async function getClubContactRequests(
  scoutUserId: string
): Promise<SentContactRequest[]> {
  const rows = await prisma.scoutContactRequest.findMany({
    where: { scoutUserId },
    orderBy: { createdAt: "desc" },
    include: {
      athlete: { select: { handle: true, name: true, sport: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    handle: r.athlete.handle,
    name: r.athlete.name,
    sportLabel: SPORT_LABELS[r.athlete.sport],
    status: r.status,
    message: r.message,
    createdAt: r.createdAt.toISOString().slice(0, 10),
  }));
}

export type PendingContactRequest = {
  requestId: string;
  clubName: string;
  message: string;
};

export async function getPendingContactRequests(
  athleteHandle: string
): Promise<PendingContactRequest[]> {
  const rows = await prisma.scoutContactRequest.findMany({
    where: { status: "pending", athlete: { handle: athleteHandle } },
    include: { scout: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return rows.map((r) => ({
    requestId: r.id,
    clubName: r.scout.name,
    message: r.message,
  }));
}
