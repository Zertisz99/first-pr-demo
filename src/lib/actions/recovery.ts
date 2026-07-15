"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { SORENESS_REGIONS, todayDateOnly } from "@/lib/recovery";

export type ActionState = { error?: string } | undefined;

function clamp1to10(value: number): number {
  return Math.min(10, Math.max(1, Math.round(value)));
}

// Sleep quality and mood run "higher is better"; fatigue and stress run
// "higher is worse" — that's the standard direction for a daily wellness
// questionnaire, so we invert the latter two before averaging into one
// 1–100 readiness score.
function computeReadiness(
  sleepQuality: number,
  fatigueScore: number,
  stressScore: number,
  moodScore: number
): number {
  const sum = sleepQuality + moodScore + (11 - fatigueScore) + (11 - stressScore);
  return Math.round((sum / 40) * 100);
}

export async function logRecoveryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "You need to be logged in to do that." };
  }

  const handle = String(formData.get("handle") ?? "");
  const athlete = await prisma.athlete.findUnique({ where: { handle } });
  if (!athlete) return { error: "Profile not found." };
  if (athlete.userId !== session.user.id) {
    return { error: "You can only log recovery for your own profile." };
  }

  const sleepHours = Number(formData.get("sleepHours"));
  const sleepQuality = clamp1to10(Number(formData.get("sleepQuality")));
  const fatigueScore = clamp1to10(Number(formData.get("fatigueScore")));
  const stressScore = clamp1to10(Number(formData.get("stressScore")));
  const moodScore = clamp1to10(Number(formData.get("moodScore")));
  const notes = String(formData.get("notes") ?? "").trim();

  if (!Number.isFinite(sleepHours) || sleepHours < 0 || sleepHours > 16) {
    return { error: "Enter a valid number of sleep hours." };
  }

  const soreness = SORENESS_REGIONS.map((region) => ({
    bodyRegion: region,
    intensity: Math.min(
      10,
      Math.max(0, Math.round(Number(formData.get(`soreness_${region}`)) || 0))
    ),
  })).filter((s) => s.intensity > 0);

  const readinessScore = computeReadiness(
    sleepQuality,
    fatigueScore,
    stressScore,
    moodScore
  );
  const logDate = todayDateOnly();

  const log = await prisma.recoveryLog.upsert({
    where: { athleteId_logDate: { athleteId: athlete.id, logDate } },
    update: {
      sleepHours,
      sleepQuality,
      fatigueScore,
      stressScore,
      moodScore,
      readinessScore,
      notes: notes || null,
    },
    create: {
      athleteId: athlete.id,
      logDate,
      sleepHours,
      sleepQuality,
      fatigueScore,
      stressScore,
      moodScore,
      readinessScore,
      notes: notes || null,
    },
  });

  await prisma.sorenessEntry.deleteMany({ where: { recoveryLogId: log.id } });
  if (soreness.length > 0) {
    await prisma.sorenessEntry.createMany({
      data: soreness.map((s) => ({ ...s, recoveryLogId: log.id })),
    });
  }

  revalidatePath(`/athletes/${handle}/recovery`);
}
