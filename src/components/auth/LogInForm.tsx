"use client";

import { useActionState } from "react";
import { logInAction } from "@/lib/actions/auth";

export default function LogInForm() {
  const [state, formAction, pending] = useActionState(logInAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
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
          autoComplete="current-password"
          className="rounded-md border border-line bg-surface-raised px-3 py-2.5 font-body text-sm text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2"
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
        id="login-submit"
        type="submit"
        disabled={pending}
        className="rounded-md px-5 py-2.5 font-body text-sm font-semibold disabled:opacity-60"
        style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
