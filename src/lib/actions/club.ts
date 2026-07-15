"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { SPORT_KEYS } from "@/lib/sports";
import { uniqueTeamSlug } from "@/lib/actions/team";
import type { SportKey } from "@/generated/prisma/client";

export type ActionState = { error?: string } | undefined;

export async function requireClub() {
  const session = await auth();
  if (!session?.user || session.user.role !== "club") {
    return null;
  }
  const club = await prisma.club.findUnique({ where: { adminId: session.user.id } });
  return club;
}

export async function updateClubProfileAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const club = await requireClub();
  if (!club) return { error: "You need a club account to do that." };

  const name = String(formData.get("name") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const foundedYearRaw = String(formData.get("foundedYear") ?? "").trim();
  const crestUrl = String(formData.get("crestUrl") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return { error: "Give the club a name." };
  if (!country) return { error: "Country is required." };

  let foundedYear: number | null = null;
  if (foundedYearRaw) {
    foundedYear = Number(foundedYearRaw);
    if (!Number.isFinite(foundedYear) || foundedYear < 1800 || foundedYear > 2100) {
      return { error: "Enter a valid founding year." };
    }
  }

  await prisma.club.update({
    where: { id: club.id },
    data: {
      name,
      country,
      city: city || null,
      foundedYear,
      crestUrl: crestUrl || null,
      description: description || null,
    },
  });

  revalidatePath("/club");
  redirect("/club");
}

export async function createSquadAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const club = await requireClub();
  if (!club) return { error: "You need a club account to create a squad." };

  const name = String(formData.get("name") ?? "").trim();
  const sport = String(formData.get("sport") ?? "") as SportKey;
  const ageGroup = String(formData.get("ageGroup") ?? "").trim();

  if (!name) return { error: "Give the squad a name." };
  if (!SPORT_KEYS.includes(sport)) return { error: "Choose a sport." };

  const slug = await uniqueTeamSlug(name);

  await prisma.team.create({
    data: {
      name,
      slug,
      sport,
      ageGroup: ageGroup || null,
      coachId: club.adminId,
      clubId: club.id,
    },
  });

  revalidatePath("/club");
}
