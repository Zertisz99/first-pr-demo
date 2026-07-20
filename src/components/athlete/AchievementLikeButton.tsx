import { likeAchievementAction, unlikeAchievementAction } from "@/lib/actions/achievementLikes";

export default function AchievementLikeButton({
  achievementId,
  athleteHandle,
  liked,
  count,
  accent,
}: {
  achievementId: string;
  athleteHandle: string;
  liked: boolean;
  count: number;
  accent: string;
}) {
  return (
    <form action={liked ? unlikeAchievementAction : likeAchievementAction}>
      <input type="hidden" name="achievementId" value={achievementId} />
      <input type="hidden" name="athleteHandle" value={athleteHandle} />
      <button
        type="submit"
        aria-pressed={liked}
        aria-label={liked ? "Unlike this achievement" : "Like this achievement"}
        className="flex items-center gap-1 font-data text-[10.5px] tabular-nums"
        style={{ color: liked ? accent : "var(--color-fg-faint)" }}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M12 21s-7.5-4.6-10-9.1C.6 8.4 2 5 5.3 5c1.9 0 3.3 1 4.7 2.7C11.4 6 12.8 5 14.7 5 18 5 19.4 8.4 22 11.9 19.5 16.4 12 21 12 21Z" />
        </svg>
        {count}
      </button>
    </form>
  );
}
