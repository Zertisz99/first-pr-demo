"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireClub } from "@/lib/actions/club";
import { notifyUsers } from "@/lib/notifications";

export type ActionState = { error?: string } | undefined;

export async function inviteCoachAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const club = await requireClub();
  if (!club) return { error: "You need a club account to do that." };

  const teamId = String(formData.get("teamId") ?? "");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!teamId || !email) return { error: "Enter the coach's email." };

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.clubId !== club.id) {
    return { error: "That squad doesn't belong to your club." };
  }

  const coach = await prisma.user.findUnique({ where: { email } });
  if (!coach || coach.role !== "coach") {
    return { error: "No coach account found with that email." };
  }
  if (coach.id === team.coachId) {
    return { error: "That coach already manages this squad." };
  }

  try {
    await prisma.squadCoachAssignment.create({
      data: { teamId, coachId: coach.id },
    });
  } catch {
    return { error: "That coach has already been invited to this squad." };
  }

  await notifyUsers(
    [coach.id],
    "coach_invite",
    `${club.name} invited you to help coach ${team.name}`,
    "/coach"
  );

  revalidatePath("/club");
}

export async function removeCoachAssignmentAction(formData: FormData): Promise<void> {
  const club = await requireClub();
  if (!club) return;

  const assignmentId = String(formData.get("assignmentId") ?? "");
  if (!assignmentId) return;

  const assignment = await prisma.squadCoachAssignment.findUnique({
    where: { id: assignmentId },
    include: { team: { select: { clubId: true } } },
  });
  if (!assignment || assignment.team.clubId !== club.id) return;

  await prisma.squadCoachAssignment.delete({ where: { id: assignmentId } });
  revalidatePath("/club");
}

export async function respondToCoachInviteAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const assignmentId = String(formData.get("assignmentId") ?? "");
  const decision = String(formData.get("decision") ?? "");

  const assignment = await prisma.squadCoachAssignment.findUnique({
    where: { id: assignmentId },
  });
  if (
    !assignment ||
    assignment.coachId !== session.user.id ||
    assignment.status !== "pending"
  ) {
    return;
  }

  if (decision === "accept") {
    await prisma.squadCoachAssignment.update({
      where: { id: assignmentId },
      data: { status: "active" },
    });
  } else if (decision === "decline") {
    await prisma.squadCoachAssignment.delete({ where: { id: assignmentId } });
  }

  revalidatePath("/coach");
}
