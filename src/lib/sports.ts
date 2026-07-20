export type SportKey =
  "football" | "basketball" | "tennis" | "swimming" | "athletics" | "martial" | "fitness";

export const SPORT_LABELS: Record<SportKey, string> = {
  football: "Football",
  basketball: "Basketball",
  tennis: "Tennis",
  swimming: "Swimming",
  athletics: "Athletics",
  martial: "Martial Arts",
  fitness: "Fitness",
};

export const SPORT_KEYS = Object.keys(SPORT_LABELS) as SportKey[];

/** CSS var string — resolves via the [data-sport] cascade set up in globals.css. */
export const SPORT_LIVE_ACCENT = "var(--color-sport-live)";

/** The paired second color in each sport's two-tone theme (e.g. football's electric blue). */
export const SPORT_LIVE_ACCENT_SECONDARY = "var(--color-sport-live-secondary)";

// "Starting XI" only means something for football; other sports field a
// team differently (a starting five, or individual singles/doubles
// rubbers), so the team-sheet role labels vary per sport. The athlete's
// actual role (e.g. "Singles", "1st doubles") lives in the free-text
// position field on the lineup entry, not in this label.
export const ROLE_LABELS: Record<SportKey, { starter: string; bench: string }> = {
  football: { starter: "Starting XI", bench: "Bench" },
  basketball: { starter: "Starting Five", bench: "Bench" },
  tennis: { starter: "Selected to play", bench: "Reserve" },
  swimming: { starter: "Selected to race", bench: "Reserve" },
  athletics: { starter: "Selected to compete", bench: "Reserve" },
  martial: { starter: "Selected to compete", bench: "Reserve" },
  fitness: { starter: "Selected", bench: "Reserve" },
};
