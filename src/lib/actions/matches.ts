"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notifyUsers } from "@/lib/notifications";
import { ROLE_LABELS } from "@/lib/sports";

export type ActionState = { error?: string } | undefined;

async function requireCoachTeam(teamId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "coach") return null;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.coachId !== session.user.id) return null;

  return team;
}

export async function createMatchAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = String(formData.get("teamId") ?? "");
  const team = await requireCoachTeam(teamId);
  if (!team) return { error: "That team doesn't belong to you." };

  const opponent = String(formData.get("opponent") ?? "").trim();
  const matchDateStr = String(formData.get("matchDate") ?? "");
  const venue = String(formData.get("venue") ?? "").trim();

  if (!opponent) return { error: "Enter an opponent." };
  if (!matchDateStr) return { error: "Choose a match date." };

  const matchDate = new Date(matchDateStr);
  if (Number.isNaN(matchDate.getTime())) return { error: "Enter a valid match date." };

  await prisma.match.create({
    data: { teamId, opponent, matchDate, venue: venue || null },
  });

  revalidatePath(`/coach/teams/${teamId}/matches`);
}

const OUTCOMES = ["win", "draw", "loss"] as const;

export async function setResultAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = String(formData.get("teamId") ?? "");
  const team = await requireCoachTeam(teamId);
  if (!team) return { error: "That team doesn't belong to you." };

  const matchId = String(formData.get("matchId") ?? "");
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.teamId !== teamId) return { error: "Match not found." };

  const result = String(formData.get("result") ?? "").trim();
  const outcome = String(formData.get("outcome") ?? "");

  if (outcome && !OUTCOMES.includes(outcome as (typeof OUTCOMES)[number])) {
    return { error: "Choose a valid result." };
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      result: result || null,
      outcome: outcome ? (outcome as (typeof OUTCOMES)[number]) : null,
    },
  });

  revalidatePath(`/coach/teams/${teamId}/matches`);
}

export async function setFormationAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = String(formData.get("teamId") ?? "");
  const team = await requireCoachTeam(teamId);
  if (!team) return { error: "That team doesn't belong to you." };

  const matchId = String(formData.get("matchId") ?? "");
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.teamId !== teamId) return { error: "Match not found." };

  const formation = String(formData.get("formation") ?? "").trim();
  await prisma.match.update({
    where: { id: matchId },
    data: { formation: formation || null },
  });

  revalidatePath(`/coach/teams/${teamId}/matches`);
}

export async function setLineupRoleAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = String(formData.get("teamId") ?? "");
  const team = await requireCoachTeam(teamId);
  if (!team) return { error: "That team doesn't belong to you." };

  const matchId = String(formData.get("matchId") ?? "");
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.teamId !== teamId) return { error: "Match not found." };

  const athleteId = String(formData.get("athleteId") ?? "");
  const member = await prisma.teamMember.findFirst({
    where: { teamId, athleteId, status: "active" },
    include: { athlete: { select: { userId: true, handle: true } } },
  });
  if (!member) return { error: "That athlete isn't on this team." };

  const role = String(formData.get("role") ?? "");
  const position = String(formData.get("position") ?? "").trim();

  if (role === "none") {
    await prisma.matchLineup.deleteMany({ where: { matchId, athleteId } });
  } else if (role === "starter" || role === "bench") {
    await prisma.matchLineup.upsert({
      where: { matchId_athleteId: { matchId, athleteId } },
      update: { role, position: position || null },
      create: { matchId, athleteId, role, position: position || null },
    });

    if (member.athlete.userId) {
      const roleLabel = ROLE_LABELS[team.sport][role];
      await notifyUsers(
        [member.athlete.userId],
        "lineup_assigned",
        `You're ${roleLabel.toLowerCase()} for the match vs ${match.opponent}`,
        `/athletes/${member.athlete.handle}/matches`
      );
    }
  } else {
    return { error: "Invalid role." };
  }

  revalidatePath(`/coach/teams/${teamId}/matches`);
}

export async function deleteMatchAction(formData: FormData): Promise<void> {
  const teamId = String(formData.get("teamId") ?? "");
  const team = await requireCoachTeam(teamId);
  if (!team) return;

  const matchId = String(formData.get("matchId") ?? "");
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.teamId !== teamId) return;

  await prisma.match.delete({ where: { id: matchId } });
  revalidatePath(`/coach/teams/${teamId}/matches`);
}
