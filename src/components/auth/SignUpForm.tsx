"use client";

import { useActionState, useState } from "react";
import { signUpAction } from "@/lib/actions/auth";
import { SPORT_KEYS, SPORT_LABELS } from "@/lib/sports";

const ROLES: { value: string; label: string; hint: string }[] = [
  { value: "athlete", label: "Athlete", hint: "Build a profile, log recovery, get seen" },
  { value: "coach", label: "Coach", hint: "Manage a roster, build training plans" },
  { value: "club", label: "Club / Academy", hint: "Manage multiple teams and coaches" },
  { value: "scout", label: "Scout / Agent", hint: "Search athletes, request contact" },
];

export default function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, undefined);
  const [role, setRole] = useState("athlete");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="name"
          className="font-display uppercase tracking-wide text-[13px] text-fg-muted"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="rounded-md border border-line bg-surface-raised px-3 py-2.5 font-body text-sm text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2"
          style={{ outlineColor: "var(--color-accent)" }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="font-display uppercase tracking-wide text-[13px] text-fg-muted"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-line bg-surface-raised px-3 py-2.5 font-body text-sm text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2"
          style={{ outlineColor: "var(--color-accent)" }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="font-display uppercase tracking-wide text-[13px] text-fg-muted"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-md border border-line bg-surface-raised px-3 py-2.5 font-body text-sm text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2"
          style={{ outlineColor: "var(--color-accent)" }}
        />
        <p className="font-body text-[12px] text-fg-faint">At least 8 characters.</p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-display uppercase tracking-wide text-[13px] text-fg-muted">
          I am a...
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ROLES.map((r) => (
            <label
              key={r.value}
              className="flex cursor-pointer flex-col gap-0.5 rounded-md border border-line bg-surface-raised px-3 py-2.5 has-[:checked]:border-accent"
            >
              <span className="flex items-center gap-2 font-body text-sm font-semibold text-fg">
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={role === r.value}
                  onChange={() => setRole(r.value)}
                  required
                  style={{ accentColor: "var(--color-accent)" }}
                />
                {r.label}
              </span>
              <span className="pl-5 font-body text-[12px] text-fg-muted">{r.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {role === "athlete" && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="sport"
            className="font-display uppercase tracking-wide text-[13px] text-fg-muted"
          >
            Sport
          </label>
          <select
            id="sport"
            name="sport"
            required
            defaultValue=""
            className="rounded-md border border-line bg-surface-raised px-3 py-2.5 font-body text-sm text-fg focus-visible:outline focus-visible:outline-2"
            style={{ outlineColor: "var(--color-accent)" }}
          >
            <option value="" disabled>
              Choose your sport
            </option>
            {SPORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {SPORT_LABELS[key]}
              </option>
            ))}
          </select>
          <p className="font-body text-[12px] text-fg-faint">
            You&apos;ll fill in the rest of your profile right after signing up.
          </p>
        </div>
      )}

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
        id="signup-submit"
        type="submit"
        disabled={pending}
        className="rounded-md px-5 py-2.5 font-body text-sm font-semibold disabled:opacity-60"
        style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
