"use client";

import { useActionState, useState } from "react";
import { logRecoveryAction } from "@/lib/actions/recovery";
import { SORENESS_REGIONS } from "@/lib/recovery-constants";
import type { RecoveryEntry } from "@/lib/recovery";

const labelClass = "font-display uppercase tracking-wide text-[13px] text-fg-muted";

function Slider({
  name,
  value,
  onChange,
  lowLabel,
  highLabel,
  min = 1,
  max = 10,
}: {
  name: string;
  value: number;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className={labelClass}>{name}</span>
        <span className="font-data text-sm font-semibold tabular-nums text-fg">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: "var(--color-accent)" }}
        className="w-full"
      />
      <div className="flex justify-between font-body text-[11px] text-fg-faint">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

export default function RecoveryLogForm({
  athleteHandle,
  today,
}: {
  athleteHandle: string;
  today: RecoveryEntry | null;
}) {
  const [state, formAction, pending] = useActionState(logRecoveryAction, undefined);

  const [sleepQuality, setSleepQuality] = useState(today?.sleepQuality ?? 6);
  const [fatigueScore, setFatigueScore] = useState(today?.fatigueScore ?? 4);
  const [stressScore, setStressScore] = useState(today?.stressScore ?? 4);
  const [moodScore, setMoodScore] = useState(today?.moodScore ?? 6);

  const sorenessDefaults: Record<string, number> = Object.fromEntries(
    SORENESS_REGIONS.map((region) => [
      region,
      today?.soreness.find((s) => s.bodyRegion === region)?.intensity ?? 0,
    ])
  );
  const [soreness, setSoreness] = useState(sorenessDefaults);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-6 rounded-lg border border-line bg-surface-raised p-5"
    >
      <input type="hidden" name="handle" value={athleteHandle} />
      <input type="hidden" name="sleepQuality" value={sleepQuality} />
      <input type="hidden" name="fatigueScore" value={fatigueScore} />
      <input type="hidden" name="stressScore" value={stressScore} />
      <input type="hidden" name="moodScore" value={moodScore} />
      {SORENESS_REGIONS.map((region) => (
        <input
          key={region}
          type="hidden"
          name={`soreness_${region}`}
          value={soreness[region]}
        />
      ))}

      <div>
        <h3 className="font-display uppercase tracking-wide text-[15px] text-fg mb-1">
          Today&apos;s check-in
        </h3>
        <p className="font-body text-[12.5px] text-fg-muted">
          {today ? "Already logged today — update it below." : "Takes about a minute."}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="sleepHours" className={labelClass}>
          Sleep hours
        </label>
        <input
          id="sleepHours"
          name="sleepHours"
          type="number"
          step={0.25}
          min={0}
          max={16}
          required
          defaultValue={today?.sleepHours ?? 8}
          className="rounded-md border border-line bg-surface-sunken px-3 py-2 font-data text-sm text-fg tabular-nums focus-visible:outline focus-visible:outline-2"
          style={{ outlineColor: "var(--color-accent)" }}
        />
      </div>

      <Slider
        name="Sleep quality"
        value={sleepQuality}
        onChange={setSleepQuality}
        lowLabel="Poor"
        highLabel="Excellent"
      />
      <Slider
        name="Fatigue"
        value={fatigueScore}
        onChange={setFatigueScore}
        lowLabel="Fresh"
        highLabel="Exhausted"
      />
      <Slider
        name="Stress"
        value={stressScore}
        onChange={setStressScore}
        lowLabel="Calm"
        highLabel="Very stressed"
      />
      <Slider
        name="Mood"
        value={moodScore}
        onChange={setMoodScore}
        lowLabel="Low"
        highLabel="Great"
      />

      <fieldset className="flex flex-col gap-3">
        <legend className={`mb-1 ${labelClass}`}>Soreness</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SORENESS_REGIONS.map((region) => (
            <Slider
              key={region}
              name={region}
              value={soreness[region]}
              onChange={(v) => setSoreness((prev) => ({ ...prev, [region]: v }))}
              lowLabel="None"
              highLabel="Severe"
              min={0}
              max={10}
            />
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className={labelClass}>
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={today?.notes ?? ""}
          placeholder="Anything worth flagging?"
          className="rounded-md border border-line bg-surface-sunken px-3 py-2 font-body text-sm text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2"
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
        id="log-recovery-submit"
        type="submit"
        disabled={pending}
        className="self-start rounded-md px-5 py-2.5 font-body text-sm font-semibold disabled:opacity-60"
        style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}
      >
        {pending ? "Saving…" : today ? "Update check-in" : "Save check-in"}
      </button>
    </form>
  );
}
