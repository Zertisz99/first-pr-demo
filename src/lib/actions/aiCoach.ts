"use server";

import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getRecoveryHistory, getTodayEntry, type RecoveryEntry } from "@/lib/recovery";

const client = new Anthropic();

const SYSTEM_PROMPT =
  "You are a supportive recovery coach for an athlete training platform. " +
  "You'll be given an athlete's recent daily wellness check-ins (readiness score, " +
  "sleep, fatigue, stress, mood, soreness, notes). Write a short, encouraging, " +
  "specific insight — 3 to 5 sentences — that references at least one concrete " +
  "number from the data and ends with one clear, actionable suggestion for today. " +
  "You support the athlete's own judgment and their coach's guidance; you do not " +
  "diagnose injuries or replace medical or coaching advice. If the data suggests " +
  "something concerning (e.g. persistent poor sleep, rising soreness, a very low " +
  "readiness score), gently suggest they flag it with their coach rather than " +
  "pushing through. Speak directly to the athlete in second person. Do not use " +
  "markdown formatting.";

function summarizeEntry(entry: RecoveryEntry): string {
  const soreness =
    entry.soreness.length > 0
      ? `, soreness: ${entry.soreness.map((s) => `${s.bodyRegion} ${s.intensity}/10`).join(", ")}`
      : "";
  const notes = entry.notes ? `, notes: "${entry.notes}"` : "";
  return (
    `${entry.date}: readiness ${entry.readinessScore}/100, sleep ${entry.sleepHours}h ` +
    `(quality ${entry.sleepQuality}/10), fatigue ${entry.fatigueScore}/10, ` +
    `stress ${entry.stressScore}/10, mood ${entry.moodScore}/10${soreness}${notes}`
  );
}

export async function getRecoveryCoachInsight(
  handle: string
): Promise<{ insight: string } | { error: string }> {
  const session = await auth();
  if (!session?.user) {
    return { error: "You need to be logged in to do that." };
  }

  const athlete = await prisma.athlete.findUnique({ where: { handle } });
  if (!athlete) return { error: "Profile not found." };
  if (athlete.userId !== session.user.id) {
    return { error: "You can only get insights for your own profile." };
  }

  const [history, today] = await Promise.all([
    getRecoveryHistory(handle, 14),
    getTodayEntry(handle),
  ]);

  const entries =
    today && !history.some((e) => e.date === today.date) ? [...history, today] : history;

  if (entries.length === 0) {
    return { error: "Log a few check-ins first so there's something to work with." };
  }

  const summary = entries.map(summarizeEntry).join("\n");

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 500,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content:
            `Here is my recovery data from the last ${entries.length} day(s), oldest first:\n\n` +
            `${summary}\n\nWhat's your read on how I'm doing, and what should I focus on today?`,
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return { error: "The AI coach couldn't respond to that — try again later." };
    }

    const text = response.content.find((block) => block.type === "text")?.text;
    if (!text) {
      return { error: "The AI coach didn't return a response — try again." };
    }
    return { insight: text.trim() };
  } catch (err) {
    console.error("AI recovery coach error:", err);
    return { error: "Couldn't reach the AI coach right now — try again in a moment." };
  }
}
