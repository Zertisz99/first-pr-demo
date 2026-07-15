import type { Athlete } from "@/lib/athletes";

export default function StatRail({ athlete }: { athlete: Athlete }) {
  const physical: { label: string; value: string }[] = [
    { label: "Age", value: `${athlete.age}` },
    { label: "Height", value: `${athlete.heightCm} cm` },
    { label: "Weight", value: `${athlete.weightKg} kg` },
    { label: "Dominant side", value: athlete.dominantSide },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {[...physical, ...athlete.headlineStats].map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-line bg-surface-raised px-3 py-3"
        >
          <div className="font-data text-xl font-semibold tabular-nums text-fg whitespace-nowrap">
            {stat.value}
          </div>
          <div className="mt-0.5 font-data text-[10.5px] uppercase tracking-wide text-fg-faint">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
