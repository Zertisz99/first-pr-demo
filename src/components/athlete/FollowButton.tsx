import { followAthleteAction, unfollowAthleteAction } from "@/lib/actions/follows";

export default function FollowButton({
  athleteId,
  athleteHandle,
  isFollowing,
}: {
  athleteId: string;
  athleteHandle: string;
  isFollowing: boolean;
}) {
  return (
    <form action={isFollowing ? unfollowAthleteAction : followAthleteAction}>
      <input type="hidden" name="athleteId" value={athleteId} />
      <input type="hidden" name="athleteHandle" value={athleteHandle} />
      {isFollowing ? (
        <button
          type="submit"
          className="rounded-md border border-line-strong px-5 py-2.5 font-body text-sm font-semibold text-fg"
        >
          Following
        </button>
      ) : (
        <button
          type="submit"
          className="rounded-md px-5 py-2.5 font-body text-sm font-semibold"
          style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}
        >
          Follow
        </button>
      )}
    </form>
  );
}
