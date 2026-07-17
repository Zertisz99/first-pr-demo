"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireClub } from "@/lib/actions/club";
import { notifyUsers } from "@/lib/notifications";

export type ActionState = { error?: string } | undefined;

async function requireScoutOrClub(): Promise<
  { scoutUserId: string; displayName: string } | null
> {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role === "club") {
    const club = await requireClub();
    return club ? { scoutUserId: club.adminId, displayName: club.name } : null;
  }
  if (session.user.role === "scout") {
    return { scoutUserId: session.user.id, displayName: session.user.name ?? "A scout" };
  }
  return null;
}

export async function addToWatchlistAction(formData: FormData): Promise<void> {
  const actor = await requireScoutOrClub();
  if (!actor) return;

  const athleteId = String(formData.get("athleteId") ?? "");
  const athleteHandle = String(formData.get("athleteHandle") ?? "");
  if (!athleteId) return;

  try {
    await prisma.scoutWatchlist.create({
      data: { scoutUserId: actor.scoutUserId, athleteId },
    });
  } catch {
    // already watchlisted — no-op
  }

  if (athleteHandle) revalidatePath(`/athletes/${athleteHandle}`);
  revalidatePath("/club/recruitment");
  revalidatePath("/scout");
}

export async function removeFromWatchlistAction(formData: FormData): Promise<void> {
  const actor = await requireScoutOrClub();
  if (!actor) return;

  const athleteId = String(formData.get("athleteId") ?? "");
  const athleteHandle = String(formData.get("athleteHandle") ?? "");
  if (!athleteId) return;

  await prisma.scoutWatchlist.deleteMany({
    where: { scoutUserId: actor.scoutUserId, athleteId },
  });

  if (athleteHandle) revalidatePath(`/athletes/${athleteHandle}`);
  revalidatePath("/club/recruitment");
  revalidatePath("/scout");
}

export async function sendContactRequestAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireScoutOrClub();
  if (!actor) return { error: "You need a club or scout account to do that." };

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
    where: { scoutUserId: actor.scoutUserId, athleteId, status: "pending" },
    select: { id: true },
  });
  if (existing) return { error: "You already have a pending request with this athlete." };

  await prisma.scoutContactRequest.create({
    data: { scoutUserId: actor.scoutUserId, athleteId, message },
  });

  await notifyUsers(
    [athlete.userId],
    "contact_request",
    `${actor.displayName} sent you a contact request`,
    { link: `/athletes/${athlete.handle}`, senderId: actor.scoutUserId }
  );

  revalidatePath(`/athletes/${athlete.handle}`);
  revalidatePath("/club/recruitment");
  revalidatePath("/scout");
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
