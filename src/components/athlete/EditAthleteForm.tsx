"use client";

import { useActionState } from "react";
import { updateAthleteProfileAction } from "@/lib/actions/athlete";
import { SPORT_KEYS, SPORT_LABELS } from "@/lib/sports";
import type { Athlete } from "@/lib/athletes";

const SIDES = ["Left", "Right", "Both"] as const;

const fieldClass =
  "rounded-md border border-line bg-surface-raised px-3 py-2.5 font-body text-sm text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2";
const labelClass = "font-display uppercase tracking-wide text-[13px] text-fg-muted";

export default function EditAthleteForm({ athlete }: { athlete: Athlete }) {
  const [state, formAction, pending] = useActionState(
    updateAthleteProfileAction,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="handle" value={athlete.handle} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="sport" className={labelClass}>
          Sport
        </label>
        <select
          id="sport"
          name="sport"
          required
          defaultValue={athlete.sport}
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        >
          {SPORT_KEYS.map((key) => (
            <option key={key} value={key}>
              {SPORT_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="position" className={labelClass}>
          Position
        </label>
        <input
          id="position"
          name="position"
          type="text"
          required
          defaultValue={athlete.position === "Not set" ? "" : athlete.position}
          placeholder="e.g. Central Midfielder"
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="age" className={labelClass}>
            Age
          </label>
          <input
            id="age"
            name="age"
            type="number"
            required
            min={10}
            max={80}
            defaultValue={athlete.age}
            className={fieldClass}
            style={{ outlineColor: "var(--color-accent)" }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="heightCm" className={labelClass}>
            Height (cm)
          </label>
          <input
            id="heightCm"
            name="heightCm"
            type="number"
            required
            min={100}
            max={250}
            defaultValue={athlete.heightCm}
            className={fieldClass}
            style={{ outlineColor: "var(--color-accent)" }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="weightKg" className={labelClass}>
            Weight (kg)
          </label>
          <input
            id="weightKg"
            name="weightKg"
            type="number"
            required
            min={30}
            max={200}
            defaultValue={athlete.weightKg}
            className={fieldClass}
            style={{ outlineColor: "var(--color-accent)" }}
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className={`mb-1 ${labelClass}`}>Dominant side</legend>
        <div className="flex gap-4">
          {SIDES.map((side) => (
            <label
              key={side}
              className="flex items-center gap-1.5 font-body text-sm text-fg"
            >
              <input
                type="radio"
                name="dominantSide"
                value={side}
                defaultChecked={athlete.dominantSide === side}
                required
                style={{ accentColor: "var(--color-accent)" }}
              />
              {side}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nationality" className={labelClass}>
            Nationality
          </label>
          <input
            id="nationality"
            name="nationality"
            type="text"
            required
            defaultValue={athlete.nationality === "Not set" ? "" : athlete.nationality}
            className={fieldClass}
            style={{ outlineColor: "var(--color-accent)" }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="club" className={labelClass}>
            Club
          </label>
          <input
            id="club"
            name="club"
            type="text"
            required
            defaultValue={athlete.club === "Independent" ? "" : athlete.club}
            className={fieldClass}
            style={{ outlineColor: "var(--color-accent)" }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className={labelClass}>
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          required
          rows={4}
          defaultValue={
            athlete.bio === "This athlete hasn't written a bio yet." ? "" : athlete.bio
          }
          placeholder="A couple of sentences about your game."
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        />
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-md border px-3 py-2 font-body text-[13px]"
          style={{ borderColor: "var(--color-bad)", color: "var(--color-bad)" }}
        >
          {state.error}
        </p>
      )}

      <button
        id="edit-profile-submit"
        type="submit"
        disabled={pending}
        className="rounded-md px-5 py-2.5 font-body text-sm font-semibold disabled:opacity-60"
        style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
