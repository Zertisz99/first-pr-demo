"use client";

import { useActionState } from "react";
import { updateClubProfileAction } from "@/lib/actions/club";
import type { ClubProfile } from "@/lib/clubs";

const fieldClass =
  "rounded-md border border-line bg-surface-raised px-3 py-2.5 font-body text-sm text-fg placeholder:text-fg-faint focus-visible:outline focus-visible:outline-2";
const labelClass = "font-display uppercase tracking-wide text-[13px] text-fg-muted";

export default function EditClubForm({ club }: { club: ClubProfile }) {
  const [state, formAction, pending] = useActionState(updateClubProfileAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={labelClass}>
          Club name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={club.name}
          className={fieldClass}
          style={{ outlineColor: "var(--color-accent)" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="country" className={labelClass}>
            Country
          </label>
          <input
            id="country"
            name="country"
            type="text"
            required
            defaultValue={club.country === "Not set" ? "" : club.country}
            className={fieldClass}
            style={{ outlineColor: "var(--color-accent)" }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className={labelClass}>
            City (optional)
          </label>
          <input
            id="city"
            name="city"
            type="text"
            defaultValue={club.city ?? ""}
            className={fieldClass}
            style={{ outlineColor: "var(--color-accent)" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="foundedYear" className={labelClass}>
            Founded (optional)
          </label>
          <input
            id="foundedYear"
            name="foundedYear"
            type="number"
            min={1800}
            max={2100}
            defaultValue={club.foundedYear ?? ""}
            className={fieldClass}
            style={{ outlineColor: "var(--color-accent)" }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="crestUrl" className={labelClass}>
            Crest URL (optional)
          </label>
          <input
            id="crestUrl"
            name="crestUrl"
            type="text"
            placeholder="https://…"
            defaultValue={club.crestUrl ?? ""}
            className={fieldClass}
            style={{ outlineColor: "var(--color-accent)" }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className={labelClass}>
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={club.description ?? ""}
          placeholder="A couple of sentences about the club."
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
        id="edit-club-submit"
        type="submit"
        disabled={pending}
        className="self-start rounded-md px-5 py-2.5 font-body text-sm font-semibold disabled:opacity-60"
        style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}
      >
        {pending ? "Saving…" : "Save club profile"}
      </button>
    </form>
  );
}
