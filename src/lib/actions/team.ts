"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { SPORT_KEYS } from "@/lib/sports";
import { slugify } from "@/lib/slug";
import type { SportKey } from "@/generated/prisma/client";

export type ActionState = { error?: string } | undefined;

async function requireCoach() {
  const session = await auth();
  if (!session?.user || !["coach", "club"].includes(session.user.role)) {
    return null;
  }
  return session.user;
}

export async function uniqueTeamSlug(name: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let suffix = 1;
  while (await prisma.team.findUnique({ where: { slug }, select: { id: true } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

export async function createTeamAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const coach = await requireCoach();
  if (!coach) return { error: "Only coach accounts can create teams." };

  const name = String(formData.get("name") ?? "").trim();
  const sport = String(formData.get("sport") ?? "") as SportKey;
  const ageGroup = String(formData.get("ageGroup") ?? "").trim();

  if (!name) return { error: "Give the team a name." };
  if (!SPORT_KEYS.includes(sport)) return { error: "Choose a sport." };

  const slug = await uniqueTeamSlug(name);

  await prisma.team.create({
    data: { name, slug, sport, ageGroup: ageGroup || null, coachId: coach.id },
  });

  revalidatePath("/coach");
}

export async function addTeamMemberAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const coach = await requireCoach();
  if (!coach) return { error: "Only coach accounts can manage rosters." };

  const teamId = String(formData.get("teamId") ?? "");
  const athleteHandle = String(formData.get("athleteHandle") ?? "");
  if (!teamId || !athleteHandle) return { error: "Choose an athlete to add." };

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.coachId !== coach.id) {
    return { error: "That team doesn't belong to you." };
  }

  const athlete = await prisma.athlete.findUnique({
    where: { handle: athleteHandle },
    select: { id: true, userId: true },
  });
  if (!athlete) return { error: "Athlete not found." };

  // Athletes with a claimed account get a pending invite they must accept.
  // Unclaimed profiles have no one to ask, so they're added directly —
  // this is just roster bookkeeping until that athlete signs up.
  const status = athlete.userId ? "pending" : "active";

  try {
    await prisma.teamMember.create({ data: { teamId, athleteId: athlete.id, status } });
  } catch {
    return { error: "That athlete is already on this team." };
  }

  revalidatePath("/coach");
  revalidatePath("/club");
}

export async function respondToInviteAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const teamMemberId = String(formData.get("teamMemberId") ?? "");
  const decision = String(formData.get("decision") ?? "");

  const invite = await prisma.teamMember.findUnique({
    where: { id: teamMemberId },
    include: { athlete: { select: { userId: true, handle: true } } },
  });
  if (
    !invite ||
    invite.athlete.userId !== session.user.id ||
    invite.status !== "pending"
  ) {
    return;
  }

  if (decision === "accept") {
    await prisma.teamMember.update({
      where: { id: teamMemberId },
      data: { status: "active" },
    });
  } else if (decision === "decline") {
    await prisma.teamMember.delete({ where: { id: teamMemberId } });
  }

  revalidatePath(`/athletes/${invite.athlete.handle}`);
}

export async function removeTeamMemberAction(formData: FormData): Promise<void> {
  const coach = await requireCoach();
  if (!coach) return;

  const teamId = String(formData.get("teamId") ?? "");
  const athleteId = String(formData.get("athleteId") ?? "");

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.coachId !== coach.id) return;

  await prisma.teamMember.deleteMany({ where: { teamId, athleteId } });
  revalidatePath("/coach");
  revalidatePath("/club");
}
