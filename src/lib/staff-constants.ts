import type { StaffRole } from "@/generated/prisma/client";

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  head_coach: "Head Coach",
  assistant_coach: "Assistant Coach",
  fitness_coach: "Fitness Coach",
  goalkeeper_coach: "Goalkeeper Coach",
  physio: "Physio",
  analyst: "Analyst",
};
