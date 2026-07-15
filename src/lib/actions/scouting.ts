"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireClub } from "@/lib/actions/club";
import { notifyUsers } from "@/lib/notifications";

export type ActionState = { error?: string } | undefined;

export async function addToWatchlistAction(formData: FormData): Promise<void> {
  const club = await requireClub();
  if (!club) return;

  const athleteId = String(formData.get("athleteId") ?? "");
  const athleteHandle = String(formData.get("athleteHandle") ?? "");
  if (!athleteId) return;

  try {
    await prisma.scoutWatchlist.create({
      data: { scoutUserId: club.adminId, athleteId },
    });
  } catch {
    // already watchlisted — no-op
  }

  if (athleteHandle) revalidatePath(`/athletes/${athleteHandle}`);
  revalidatePath("/club/recruitment");
}

export async function removeFromWatchlistAction(formData: FormData): Promise<void> {
  const club = await requireClub();
  if (!club) return;

  const athleteId = String(formData.get("athleteId") ?? "");
  const athleteHandle = String(formData.get("athleteHandle") ?? "");
  if (!athleteId) return;

  await prisma.scoutWatchlist.deleteMany({
    where: { scoutUserId: club.adminId, athleteId },
  });

  if (athleteHandle) revalidatePath(`/athletes/${athleteHandle}`);
  revalidatePath("/club/recruitment");
}

export async function sendContactRequestAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const club = await requireClub();
  if (!club) return { error: "You need a club account to do that." };

  const athleteId = String(formData.get("athleteId") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (!athleteId) return { error: "Athlete not found." };
  if (!message) return { error: "Add a short message." };

  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    select: { userId: true, handle: true },
  });
  if (!athlete) return { error: "Athlete not found." };
  if (!athlete.userId) return { error: "This profile hasn't been claimed yet." };

  const existing = await prisma.scoutContactRequest.findFirst({
    where: { scoutUserId: club.adminId, athleteId, status: "pending" },
    select: { id: true },
  });
  if (existing) return { error: "You already have a pending request with this athlete." };

  await prisma.scoutContactRequest.create({
    data: { scoutUserId: club.adminId, athleteId, message },
  });

  await notifyUsers(
    [athlete.userId],
    "contact_request",
    `${club.name} sent you a contact request`,
    `/athletes/${athlete.handle}`
  );

  revalidatePath(`/athletes/${athlete.handle}`);
  revalidatePath("/club/recruitment");
}

export async function respondToContactRequestAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const requestId = String(formData.get("requestId") ?? "");
  const decision = String(formData.get("decision") ?? "");

  const request = await prisma.scoutContactRequest.findUnique({
    where: { id: requestId },
    include: { athlete: { select: { userId: true, handle: true } } },
  });
  if (
    !request ||
    request.athlete.userId !== session.user.id ||
    request.status !== "pending"
  ) {
    return;
  }

  if (decision === "accept") {
    await prisma.scoutContactRequest.update({
      where: { id: requestId },
      data: { status: "accepted" },
    });
  } else if (decision === "decline") {
    await prisma.scoutContactRequest.update({
      where: { id: requestId },
      data: { status: "declined" },
    });
  }

  revalidatePath(`/athletes/${request.athlete.handle}`);
}
