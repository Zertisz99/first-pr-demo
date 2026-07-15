export const SORENESS_REGIONS = [
  "Neck",
  "Shoulders",
  "Back",
  "Quads",
  "Hamstrings",
  "Calves",
] as const;

export type SorenessRegion = (typeof SORENESS_REGIONS)[number];
