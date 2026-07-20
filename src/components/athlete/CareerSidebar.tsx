import type { Achievement, CareerStint } from "@/lib/athletes";
import type { AchievementLikeInfo } from "@/lib/achievementLikes";
import type { AchievementCommentEntry } from "@/lib/achievementComments";
import AchievementLikeButton from "@/components/athlete/AchievementLikeButton";
import AchievementCommentSection from "@/components/athlete/AchievementCommentSection";

export default function CareerSidebar({
  career,
  achievements,
  accent,
  athleteHandle,
  canLike = false,
  likeInfo = {},
  canComment = false,
  commentInfo = {},
}: {
  career: CareerStint[];
  achievements: Achievement[];
  accent: string;
  athleteHandle: string;
  canLike?: boolean;
  likeInfo?: Record<string, AchievementLikeInfo>;
  canComment?: boolean;
  commentInfo?: Record<string, AchievementCommentEntry[]>;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="font-display uppercase tracking-wide text-[13px] text-fg-muted mb-3">
          Career history
        </h3>
        <ol className="flex flex-col gap-4">
          {career.map((c) => (
            <li key={c.club} className="relative pl-4">
              <span
                className="absolute left-0 top-1.5 h-2 w-2 rounded-full"
                style={{ background: accent }}
                aria-hidden
              />
              <p className="font-body text-sm font-semibold text-fg">{c.club}</p>
              <p className="font-data text-[11px] text-fg-faint">{c.period}</p>
              {c.note && (
                <p className="font-body text-[12.5px] text-fg-muted">{c.note}</p>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h3 className="font-display uppercase tracking-wide text-[13px] text-fg-muted mb-3">
          Achievements
        </h3>
        <ul className="flex flex-col gap-3">
          {achievements.map((a) => {
            const info = likeInfo[a.id] ?? { count: 0, likedByMe: false };
            const comments = commentInfo[a.id] ?? [];
            return (
              <li key={a.id} className="flex items-start gap-2.5">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="mt-0.5 shrink-0"
                  aria-hidden
                >
                  <path
                    d="M10 1.5 12.4 3.9 15.7 3.3 16.4 6.6 19 8.8 17.3 11.7 18 15 14.7 15.7 12.9 18.5 10 17 7.1 18.5 5.3 15.7 2 15 2.7 11.7 1 8.8 3.6 6.6 4.3 3.3 7.6 3.9Z"
                    fill={accent}
                  />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="font-body text-[13.5px] font-medium text-fg">{a.title}</p>
                  <p className="font-data text-[11px] text-fg-faint">{a.period}</p>
                  <div className="mt-1 flex items-center gap-3">
                    {canLike ? (
                      <AchievementLikeButton
                        achievementId={a.id}
                        athleteHandle={athleteHandle}
                        liked={info.likedByMe}
                        count={info.count}
                        accent={accent}
                      />
                    ) : (
                      info.count > 0 && (
                        <span className="font-data text-[10.5px] tabular-nums text-fg-faint">
                          {info.count} {info.count === 1 ? "like" : "likes"}
                        </span>
                      )
                    )}
                    {(canComment || comments.length > 0) && (
                      <AchievementCommentSection
                        achievementId={a.id}
                        athleteHandle={athleteHandle}
                        comments={comments}
                        canComment={canComment}
                      />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
