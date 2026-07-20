import Link from "next/link";
import type { Athlete } from "@/lib/athletes";
import { SPORT_LABELS, SPORT_LIVE_ACCENT, SPORT_LIVE_ACCENT_SECONDARY } from "@/lib/sports";
import ScoutActions from "@/components/athlete/ScoutActions";
import FollowButton from "@/components/athlete/FollowButton";

export default function Cover({
  athlete,
  isOwner = false,
  canScoutAthlete = false,
  alreadyWatchlisted = false,
  hasPendingRequest = false,
  canFollow = false,
  isFollowing = false,
  followerCount = 0,
}: {
  athlete: Athlete;
  isOwner?: boolean;
  canScoutAthlete?: boolean;
  alreadyWatchlisted?: boolean;
  hasPendingRequest?: boolean;
  canFollow?: boolean;
  isFollowing?: boolean;
  followerCount?: number;
}) {
  const jerseyDigit = athlete.name.length % 10 || 8;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-line"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${SPORT_LIVE_ACCENT} 34%, var(--color-surface-sunken)) 0%, color-mix(in srgb, ${SPORT_LIVE_ACCENT_SECONDARY} 22%, var(--color-surface-sunken)) 100%)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-10 select-none font-display font-bold leading-none"
        style={{
          fontSize: "260px",
          color: "color-mix(in srgb, var(--color-surface) 12%, transparent)",
        }}
      >
        {jerseyDigit}
      </div>

      <div className="relative flex flex-col gap-6 p-7 sm:p-9">
        <div className="flex items-center gap-2">
          <span
            className="font-data text-[11px] font-semibold uppercase tracking-wider rounded px-2 py-1"
            style={{ background: SPORT_LIVE_ACCENT, color: "#fff" }}
          >
            {SPORT_LABELS[athlete.sport]}
          </span>
          <span className="font-data text-[11px] uppercase tracking-wider text-fg-muted">
            {athlete.position}
          </span>
          {athlete.verified && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-surface-raised/80 px-2 py-0.5 font-data text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M10 1.5 12.4 3.9 15.7 3.3 16.4 6.6 19 8.8 17.3 11.7 18 15 14.7 15.7 12.9 18.5 10 17 7.1 18.5 5.3 15.7 2 15 2.7 11.7 1 8.8 3.6 6.6 4.3 3.3 7.6 3.9Z"
                  fill={SPORT_LIVE_ACCENT}
                />
                <path
                  d="M6.5 10.2 8.8 12.5 13.5 7.5"
                  stroke="#fff"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Verified
            </span>
          )}
        </div>

        <div>
          <h1 className="font-display font-bold uppercase leading-[0.95] text-[clamp(36px,6vw,64px)] text-fg text-balance">
            {athlete.name}
          </h1>
          <p className="mt-1 font-body text-sm text-fg-muted">
            {athlete.club} &middot; {athlete.nationality}
          </p>
          <p className="mt-1 font-body text-[13px] text-fg-faint">
            {followerCount} {followerCount === 1 ? "follower" : "followers"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {isOwner ? (
            <>
              <Link
                href={`/athletes/${athlete.handle}/edit`}
                className="rounded-md px-5 py-2.5 font-body text-sm font-semibold"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-accent-fg)",
                }}
              >
                Edit profile
              </Link>
              <Link
                href={`/athletes/${athlete.handle}/recovery`}
                className="rounded-md border border-line-strong px-5 py-2.5 font-body text-sm font-semibold text-fg"
              >
                Recovery journal
              </Link>
            </>
          ) : (
            <>
              {canFollow && (
                <FollowButton
                  athleteId={athlete.id}
                  athleteHandle={athlete.handle}
                  isFollowing={isFollowing}
                />
              )}
              {canScoutAthlete && (
                <ScoutActions
                  athleteId={athlete.id}
                  athleteHandle={athlete.handle}
                  alreadyWatchlisted={alreadyWatchlisted}
                  hasPendingRequest={hasPendingRequest}
                  athleteClaimed={!!athlete.userId}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
