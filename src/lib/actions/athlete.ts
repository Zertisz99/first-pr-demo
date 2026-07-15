"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { SPORT_KEYS } from "@/lib/sports";
import type { DominantSide, SportKey } from "@/generated/prisma/client";

export type ActionState = { error?: string } | undefined;

const SIDES: DominantSide[] = ["Left", "Right", "Both"];

export async function updateAthleteProfileAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "You need to be logged in to do that." };
  }

  const handle = String(formData.get("handle") ?? "");
  const athlete = await prisma.athlete.findUnique({ where: { handle } });
  if (!athlete) {
    return { error: "Profile not found." };
  }
  if (athlete.userId !== session.user.id) {
    return { error: "You can only edit your own profile." };
  }

  const sport = String(formData.get("sport") ?? "") as SportKey;
  const position = String(formData.get("position") ?? "").trim();
  const age = Number(formData.get("age"));
  const heightCm = Number(formData.get("heightCm"));
  const weightKg = Number(formData.get("weightKg"));
  const dominantSide = String(formData.get("dominantSide") ?? "") as DominantSide;
  const nationality = String(formData.get("nationality") ?? "").trim();
  const club = String(formData.get("club") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (!SPORT_KEYS.includes(sport)) return { error: "Choose a sport." };
  if (!position) return { error: "Position is required." };
  if (!Number.isFinite(age) || age < 10 || age > 80) {
    return { error: "Enter a valid age." };
  }
  if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250) {
    return { error: "Enter a valid height in cm." };
  }
  if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 200) {
    return { error: "Enter a valid weight in kg." };
  }
  if (!SIDES.includes(dominantSide)) return { error: "Choose a dominant side." };
  if (!nationality) return { error: "Nationality is required." };
  if (!club) return { error: "Club is required." };
  if (!bio) return { error: "Add a short bio." };

  await prisma.athlete.update({
    where: { id: athlete.id },
    data: {
      sport,
      position,
      age,
      heightCm,
      weightKg,
      dominantSide,
      nationality,
      club,
      bio,
    },
  });

  revalidatePath(`/athletes/${handle}`);
  redirect(`/athletes/${handle}`);
}
