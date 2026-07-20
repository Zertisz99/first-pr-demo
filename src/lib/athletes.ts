import type { SportKey } from "@/lib/sports";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export type { SportKey };

export type AthleteStat = {
  label: string;
  value: string;
};

export type ProgressionPoint = {
  label: string;
  value: number;
};

export type Achievement = {
  id: string;
  title: string;
  period: string;
};

export type CareerStint = {
  club: string;
  period: string;
  note?: string;
};

export type HighlightVideo = {
  id: string;
  title: string;
  duration: string;
  date: string;
  source: "upload" | "wyscout" | "instat";
};

export type DataSource = {
  provider: string;
  label: string;
  verified: boolean;
};

export type Athlete = {
  id: string;
  handle: string;
  userId: string | null;
  name: string;
  sport: SportKey;
  position: string;
  age: number;
  heightCm: number;
  weightKg: number;
  dominantSide: "Left" | "Right" | "Both";
  nationality: string;
  club: string;
  verified: boolean;
  bio: string;
  headlineStats: AthleteStat[];
  progression: {
    title: string;
    unit: string;
    points: ProgressionPoint[];
  };
  achievements: Achievement[];
  career: CareerStint[];
  highlights: HighlightVideo[];
  dataSources: DataSource[];
};

const athleteWithRelations = {
  include: {
    achievements: { orderBy: { sortOrder: "asc" } },
    career: { orderBy: { sortOrder: "asc" } },
    highlights: { orderBy: { date: "desc" } },
    dataSources: true,
  },
} satisfies Prisma.AthleteDefaultArgs;

type AthleteRow = Prisma.AthleteGetPayload<typeof athleteWithRelations>;

function mapAthlete(row: AthleteRow): Athlete {
  return {
    id: row.id,
    handle: row.handle,
    userId: row.userId,
    name: row.name,
    sport: row.sport,
    position: row.position,
    age: row.age,
    heightCm: row.heightCm,
    weightKg: row.weightKg,
    dominantSide: row.dominantSide,
    nationality: row.nationality,
    club: row.club,
    verified: row.verified,
    bio: row.bio,
    headlineStats: row.headlineStats as unknown as AthleteStat[],
    progression: {
      title: row.progressionTitle,
      unit: row.progressionUnit,
      points: row.progressionPoints as unknown as ProgressionPoint[],
    },
    achievements: row.achievements.map((a) => ({
      id: a.id,
      title: a.title,
      period: a.period,
    })),
    career: row.career.map((c) => ({
      club: c.club,
      period: c.period,
      note: c.note ?? undefined,
    })),
    highlights: row.highlights.map((h) => ({
      id: h.id,
      title: h.title,
      duration: h.duration,
      date: h.date.toISOString().slice(0, 10),
      source: h.source,
    })),
    dataSources: row.dataSources.map((d) => ({
      provider: d.provider,
      label: d.label,
      verified: d.verified,
    })),
  };
}

export async function getAthlete(handle: string): Promise<Athlete | undefined> {
  const row = await prisma.athlete.findUnique({
    where: { handle },
    ...athleteWithRelations,
  });
  return row ? mapAthlete(row) : undefined;
}

export async function getAllAthletes(): Promise<Athlete[]> {
  const rows = await prisma.athlete.findMany({
    ...athleteWithRelations,
    orderBy: { name: "asc" },
  });
  return rows.map(mapAthlete);
}
