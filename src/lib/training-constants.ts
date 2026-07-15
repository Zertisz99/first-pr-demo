export const SESSION_TYPES = [
  "Strength",
  "Conditioning",
  "Skills",
  "Recovery",
  "Match prep",
  "Rest",
] as const;

export type SessionType = (typeof SESSION_TYPES)[number];

export const INTENSITY_LABELS = ["Light", "Moderate", "Hard", "Max"] as const;

export type IntensityLabel = (typeof INTENSITY_LABELS)[number];
