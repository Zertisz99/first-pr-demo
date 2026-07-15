import { prisma } from "@/lib/db";
import type { StaffRole } from "@/generated/prisma/client";

export { STAFF_ROLE_LABELS } from "@/lib/staff-constants";

export type StaffEntry = {
  id: string;
  name: string;
  role: StaffRole;
  email: string | null;
};

export async function getTeamStaff(teamId: string): Promise<StaffEntry[]> {
  const rows = await prisma.teamStaff.findMany({
    where: { teamId },
    orderBy: { role: "asc" },
  });

  return rows.map((s) => ({ id: s.id, name: s.name, role: s.role, email: s.email }));
}
