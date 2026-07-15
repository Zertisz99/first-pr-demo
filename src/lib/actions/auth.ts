"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";
import { signIn, signOut } from "@/auth";
import { slugify } from "@/lib/slug";
import { SPORT_KEYS } from "@/lib/sports";
import type { SportKey, UserRole } from "@/generated/prisma/client";

export type ActionState = { error?: string } | undefined;

const ROLES: UserRole[] = ["athlete", "coach", "club", "scout"];

async function uniqueHandle(name: string): Promise<string> {
  const base = slugify(name);
  let handle = base;
  let suffix = 1;
  while (await prisma.athlete.findUnique({ where: { handle }, select: { id: true } })) {
    suffix += 1;
    handle = `${base}-${suffix}`;
  }
  return handle;
}

export async function signUpAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "") as UserRole;

  if (!name || !email || !password) {
    return { error: "Fill in every field." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!ROLES.includes(role)) {
    return { error: "Choose an account type." };
  }

  let sport: SportKey | undefined;
  if (role === "athlete") {
    sport = String(formData.get("sport") ?? "") as SportKey;
    if (!SPORT_KEYS.includes(sport)) {
      return { error: "Choose your sport." };
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  let redirectTo = "/discover";

  if (role === "athlete" && sport) {
    const handle = await uniqueHandle(name);
    await prisma.athlete.create({
      data: {
        handle,
        name,
        sport,
        position: "Not set",
        age: 18,
        heightCm: 170,
        weightKg: 70,
        dominantSide: "Right",
        nationality: "Not set",
        club: "Independent",
        bio: "This athlete hasn't written a bio yet.",
        headlineStats: [],
        progressionTitle: "Performance index",
        progressionUnit: "no data logged yet",
        progressionPoints: [],
        userId: user.id,
      },
    });
    redirectTo = `/athletes/${handle}/edit`;
  }

  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Account created, but sign-in failed — try logging in." };
    }
    throw err;
  }
}

export async function logInAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirectTo: "/discover" });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Incorrect email or password." };
    }
    throw err;
  }
}

export async function logOutAction() {
  await signOut({ redirectTo: "/" });
}
