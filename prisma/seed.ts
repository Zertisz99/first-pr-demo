import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SeedAthlete = Parameters<typeof prisma.athlete.create>[0]["data"] & {
  achievements: { create: { title: string; period: string; sortOrder: number }[] };
  career: {
    create: { club: string; period: string; note?: string; sortOrder: number }[];
  };
  highlights: {
    create: {
      title: string;
      duration: string;
      date: Date;
      source: "upload" | "wyscout" | "instat";
    }[];
  };
  dataSources: { create: { provider: string; label: string; verified: boolean }[] };
};

const athletes: SeedAthlete[] = [
  {
    handle: "amara-okafor",
    name: "Amara Okafor",
    sport: "football",
    position: "Central Midfielder",
    age: 24,
    heightCm: 168,
    weightKg: 61,
    dominantSide: "Right",
    nationality: "Nigeria",
    club: "Northbridge FC",
    verified: true,
    bio: "Box-to-box midfielder known for her range of passing and defensive work rate. Captain of Northbridge FC since 2024, with two full seasons of senior international experience.",
    headlineStats: [
      { label: "Matches", value: "27" },
      { label: "Distance / 90", value: "4.2 km" },
      { label: "Pass accuracy", value: "86%" },
      { label: "Goals + assists", value: "9" },
    ],
    progressionTitle: "Performance index",
    progressionUnit: "season trend, last 10 matches",
    progressionPoints: [
      { label: "M1", value: 61 },
      { label: "M2", value: 58 },
      { label: "M3", value: 66 },
      { label: "M4", value: 64 },
      { label: "M5", value: 71 },
      { label: "M6", value: 69 },
      { label: "M7", value: 77 },
      { label: "M8", value: 74 },
      { label: "M9", value: 82 },
      { label: "M10", value: 89 },
    ],
    achievements: {
      create: [
        { title: "League Golden Boot, midfielders", period: "2023", sortOrder: 0 },
        { title: "Captain, Northbridge FC", period: "2024–present", sortOrder: 1 },
        { title: "U20 squad, continental championship", period: "2021", sortOrder: 2 },
      ],
    },
    career: {
      create: [
        { club: "Northbridge FC", period: "2024–present", note: "Captain", sortOrder: 0 },
        {
          club: "FC Meridian",
          period: "2021–2024",
          note: "112 apps, 14 goals",
          sortOrder: 1,
        },
        {
          club: "Rivers United Women",
          period: "2019–2021",
          note: "Youth academy graduate",
          sortOrder: 2,
        },
      ],
    },
    highlights: {
      create: [
        {
          title: "Season highlights — midfield range",
          duration: "3:12",
          date: new Date("2026-06-02"),
          source: "upload",
        },
        {
          title: "vs. FC Meridian — full match tags",
          duration: "1:47",
          date: new Date("2026-05-18"),
          source: "wyscout",
        },
        {
          title: "Defensive actions compilation",
          duration: "2:05",
          date: new Date("2026-04-30"),
          source: "instat",
        },
        {
          title: "Assist — outside-of-boot through ball",
          duration: "0:14",
          date: new Date("2026-04-11"),
          source: "upload",
        },
      ],
    },
    dataSources: {
      create: [
        { provider: "Catapult", label: "GPS & load data", verified: true },
        { provider: "Wyscout", label: "Match events", verified: true },
        { provider: "InStat", label: "Physical & video tagging", verified: true },
        { provider: "Self-reported", label: "Bio & career history", verified: false },
      ],
    },
  },
  {
    handle: "luka-peric",
    name: "Luka Peric",
    sport: "basketball",
    position: "Point Guard",
    age: 22,
    heightCm: 191,
    weightKg: 84,
    dominantSide: "Right",
    nationality: "Serbia",
    club: "Ironclad BC",
    verified: true,
    bio: "Floor general with an elite assist-to-turnover ratio. Runs Ironclad's half-court offense and leads the league in fourth-quarter minutes.",
    headlineStats: [
      { label: "Games", value: "31" },
      { label: "Points / game", value: "18.4" },
      { label: "PER", value: "22.1" },
      { label: "3P%", value: "39%" },
    ],
    progressionTitle: "Performance index",
    progressionUnit: "season trend, last 10 games",
    progressionPoints: [
      { label: "G1", value: 55 },
      { label: "G2", value: 60 },
      { label: "G3", value: 57 },
      { label: "G4", value: 65 },
      { label: "G5", value: 63 },
      { label: "G6", value: 70 },
      { label: "G7", value: 68 },
      { label: "G8", value: 75 },
      { label: "G9", value: 79 },
      { label: "G10", value: 84 },
    ],
    achievements: {
      create: [
        { title: "All-Star selection", period: "2026", sortOrder: 0 },
        { title: "Assists leader, regular season", period: "2025", sortOrder: 1 },
        { title: "Rookie of the Year", period: "2023", sortOrder: 2 },
      ],
    },
    career: {
      create: [
        {
          club: "Ironclad BC",
          period: "2023–present",
          note: "Starting point guard",
          sortOrder: 0,
        },
        {
          club: "Belgrade Youth Academy",
          period: "2019–2023",
          note: "Academy graduate",
          sortOrder: 1,
        },
      ],
    },
    highlights: {
      create: [
        {
          title: "Season highlights — playmaking",
          duration: "2:48",
          date: new Date("2026-06-10"),
          source: "upload",
        },
        {
          title: "vs. Coastal Kings — full tags",
          duration: "1:32",
          date: new Date("2026-05-22"),
          source: "instat",
        },
        {
          title: "Clutch fourth-quarter possessions",
          duration: "1:58",
          date: new Date("2026-05-02"),
          source: "upload",
        },
      ],
    },
    dataSources: {
      create: [
        { provider: "Catapult", label: "Load & minutes data", verified: true },
        { provider: "InStat", label: "Shot & possession tagging", verified: true },
        { provider: "Self-reported", label: "Bio & career history", verified: false },
      ],
    },
  },
  {
    handle: "sofia-lindqvist",
    name: "Sofia Lindqvist",
    sport: "tennis",
    position: "Singles",
    age: 20,
    heightCm: 174,
    weightKg: 63,
    dominantSide: "Left",
    nationality: "Sweden",
    club: "Nordberg Tennis Academy",
    verified: true,
    bio: "Left-handed baseliner with a heavy topspin forehand. Broke into the top 150 this season on the strength of a 14-match hard-court win streak.",
    headlineStats: [
      { label: "Matches", value: "34" },
      { label: "Avg serve speed", value: "168 km/h" },
      { label: "Avg rally length", value: "5.2 shots" },
      { label: "World ranking", value: "#142" },
    ],
    progressionTitle: "Performance index",
    progressionUnit: "season trend, last 10 matches",
    progressionPoints: [
      { label: "M1", value: 48 },
      { label: "M2", value: 52 },
      { label: "M3", value: 50 },
      { label: "M4", value: 59 },
      { label: "M5", value: 63 },
      { label: "M6", value: 61 },
      { label: "M7", value: 70 },
      { label: "M8", value: 74 },
      { label: "M9", value: 78 },
      { label: "M10", value: 83 },
    ],
    achievements: {
      create: [
        { title: "ITF title, singles", period: "2026", sortOrder: 0 },
        { title: "Top 150 debut", period: "2026", sortOrder: 1 },
        { title: "Junior national champion", period: "2022", sortOrder: 2 },
      ],
    },
    career: {
      create: [
        {
          club: "Nordberg Tennis Academy",
          period: "2022–present",
          note: "Full-time pro",
          sortOrder: 0,
        },
        {
          club: "Malmo Junior Circuit",
          period: "2018–2022",
          note: "Junior development",
          sortOrder: 1,
        },
      ],
    },
    highlights: {
      create: [
        {
          title: "14-match win streak — recap",
          duration: "2:20",
          date: new Date("2026-06-05"),
          source: "upload",
        },
        {
          title: "Final vs. R. Costa — full match tags",
          duration: "1:41",
          date: new Date("2026-05-28"),
          source: "wyscout",
        },
      ],
    },
    dataSources: {
      create: [
        { provider: "Catapult", label: "Movement & load data", verified: true },
        { provider: "Self-reported", label: "Bio & career history", verified: false },
      ],
    },
  },
  {
    handle: "kenji-nakamura",
    name: "Kenji Nakamura",
    sport: "swimming",
    position: "Freestyle / IM",
    age: 19,
    heightCm: 183,
    weightKg: 74,
    dominantSide: "Right",
    nationality: "Japan",
    club: "Meridian Aquatics",
    verified: true,
    bio: "Freestyle and IM specialist coming off a personal-best season. Currently taper-training toward the national qualifying meet.",
    headlineStats: [
      { label: "Races", value: "22" },
      { label: "Best 100m free", value: "48.91s" },
      { label: "Stroke rate", value: "54 spm" },
      { label: "Personal bests", value: "5" },
    ],
    progressionTitle: "Performance index",
    progressionUnit: "season trend, last 10 races",
    progressionPoints: [
      { label: "R1", value: 64 },
      { label: "R2", value: 62 },
      { label: "R3", value: 68 },
      { label: "R4", value: 66 },
      { label: "R5", value: 72 },
      { label: "R6", value: 75 },
      { label: "R7", value: 73 },
      { label: "R8", value: 80 },
      { label: "R9", value: 85 },
      { label: "R10", value: 91 },
    ],
    achievements: {
      create: [
        {
          title: "National qualifying standard, 100m free",
          period: "2026",
          sortOrder: 0,
        },
        { title: "Regional champion, 200m IM", period: "2025", sortOrder: 1 },
      ],
    },
    career: {
      create: [
        {
          club: "Meridian Aquatics",
          period: "2023–present",
          note: "Senior squad",
          sortOrder: 0,
        },
        {
          club: "Osaka Swim Club",
          period: "2017–2023",
          note: "Youth development",
          sortOrder: 1,
        },
      ],
    },
    highlights: {
      create: [
        {
          title: "48.91 split — race breakdown",
          duration: "1:05",
          date: new Date("2026-06-08"),
          source: "upload",
        },
        {
          title: "200m IM — full race tags",
          duration: "2:12",
          date: new Date("2026-05-15"),
          source: "instat",
        },
      ],
    },
    dataSources: {
      create: [
        { provider: "InStat", label: "Split & stroke tagging", verified: true },
        { provider: "Self-reported", label: "Bio & career history", verified: false },
      ],
    },
  },
  {
    handle: "zola-mabaso",
    name: "Zola Mabaso",
    sport: "athletics",
    position: "100m / 200m Sprint",
    age: 23,
    heightCm: 170,
    weightKg: 58,
    dominantSide: "Right",
    nationality: "South Africa",
    club: "Highveld Track Club",
    verified: false,
    bio: "Sprinter with a rapidly improving 100m PB, closing in on the national qualifying standard for the first time this season.",
    headlineStats: [
      { label: "Races", value: "16" },
      { label: "100m PB", value: "11.02s" },
      { label: "Season best", value: "11.09s" },
      { label: "Wind-legal PBs", value: "4" },
    ],
    progressionTitle: "Performance index",
    progressionUnit: "season trend, last 10 races",
    progressionPoints: [
      { label: "R1", value: 52 },
      { label: "R2", value: 55 },
      { label: "R3", value: 54 },
      { label: "R4", value: 60 },
      { label: "R5", value: 58 },
      { label: "R6", value: 66 },
      { label: "R7", value: 69 },
      { label: "R8", value: 72 },
      { label: "R9", value: 76 },
      { label: "R10", value: 81 },
    ],
    achievements: {
      create: [
        { title: "Provincial champion, 100m", period: "2026", sortOrder: 0 },
        {
          title: "PB progression — 5 seasons running",
          period: "2022–2026",
          sortOrder: 1,
        },
      ],
    },
    career: {
      create: [
        {
          club: "Highveld Track Club",
          period: "2024–present",
          note: "Senior squad",
          sortOrder: 0,
        },
        {
          club: "Gauteng Youth Athletics",
          period: "2019–2024",
          note: "Youth development",
          sortOrder: 1,
        },
      ],
    },
    highlights: {
      create: [
        {
          title: "11.02 PB — race breakdown",
          duration: "0:58",
          date: new Date("2026-05-30"),
          source: "upload",
        },
      ],
    },
    dataSources: {
      create: [
        { provider: "Catapult", label: "Sprint mechanics data", verified: true },
        { provider: "Self-reported", label: "Bio & career history", verified: false },
      ],
    },
  },
];

async function main() {
  for (const athlete of athletes) {
    await prisma.athlete.upsert({
      where: { handle: athlete.handle },
      update: {},
      create: athlete,
    });
    console.log(`Seeded ${athlete.name}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
