import { tagAthleteAction } from "@/lib/actions/videos";

export default function TagAthleteForm({
  teamId,
  videoId,
  candidates,
}: {
  teamId: string;
  videoId: string;
  candidates: { id: string; name: string }[];
}) {
  if (candidates.length === 0) return null;

  return (
    <form action={tagAthleteAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="teamId" value={teamId} />
      <input type="hidden" name="videoId" value={videoId} />
      <select
        name="athleteId"
        required
        defaultValue=""
        className="rounded-md border border-line bg-surface-raised px-2 py-1 font-body text-[12.5px] text-fg focus-visible:outline focus-visible:outline-2"
        style={{ outlineColor: "var(--color-accent)" }}
      >
        <option value="" disabled>
          Tag athlete…
        </option>
        {candidates.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md border border-line-strong px-2.5 py-1 font-body text-[12px] font-semibold text-fg"
      >
        Tag
      </button>
    </form>
  );
}
