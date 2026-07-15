import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getClubByAdminId } from "@/lib/clubs";
import { getClubWatchlist, getClubContactRequests } from "@/lib/scouting";
import { removeFromWatchlistAction } from "@/lib/actions/scouting";

const STATUS_COLOR: Record<string, string> = {
  pending: "var(--color-fg-faint)",
  accepted: "var(--color-good)",
  declined: "var(--color-bad)",
};

export default async function ClubRecruitmentPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "club") {
    redirect("/discover");
  }

  const club = await getClubByAdminId(session.user.id);
  if (!club) redirect("/discover");

  const [watchlist, sentRequests] = await Promise.all([
    getClubWatchlist(session.user.id),
    getClubContactRequests(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg">
            Recruitment
          </h1>
          <p className="mt-1 font-body text-sm text-fg-muted">
            Watchlist and outreach for {club.name}.
          </p>
        </div>
        <Link
          href="/club"
          className="font-body text-sm font-medium text-fg-muted hover:text-fg"
        >
          ← Club dashboard
        </Link>
      </div>

      <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wide text-fg">
        Watchlist
      </h2>
      {watchlist.length === 0 ? (
        <div className="mb-10 rounded-lg border border-dashed border-line-strong p-10 text-center">
          <p className="font-body text-sm text-fg-muted">
            No athletes watchlisted yet — visit a profile and add them there.
          </p>
        </div>
      ) : (
        <div className="mb-10 flex flex-col gap-3">
          {watchlist.map((a) => (
            <div
              key={a.athleteId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface-raised p-4"
            >
              <div>
                <Link
                  href={`/athletes/${a.handle}`}
                  className="font-body text-sm font-semibold text-fg hover:underline"
                >
                  {a.name}
                </Link>
                <p className="font-data text-[11px] uppercase tracking-wide text-fg-faint">
                  {a.sportLabel} · {a.position}
                </p>
              </div>
              <form action={removeFromWatchlistAction}>
                <input type="hidden" name="athleteId" value={a.athleteId} />
                <input type="hidden" name="athleteHandle" value={a.handle} />
                <button
                  type="submit"
                  className="font-body text-[12.5px] font-medium text-fg-muted hover:text-[var(--color-bad)]"
                >
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wide text-fg">
        Sent requests
      </h2>
      {sentRequests.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong p-10 text-center">
          <p className="font-body text-sm text-fg-muted">
            No contact requests sent yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sentRequests.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-line bg-surface-raised p-4"
            >
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/athletes/${r.handle}`}
                  className="font-body text-sm font-semibold text-fg hover:underline"
                >
                  {r.name}
                </Link>
                <span
                  className="font-data text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: STATUS_COLOR[r.status] }}
                >
                  {r.status}
                </span>
              </div>
              <p className="font-data text-[11px] uppercase tracking-wide text-fg-faint">
                {r.sportLabel} · {r.createdAt}
              </p>
              <p className="mt-2 font-body text-[13px] text-fg-muted">{r.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
