import { respondToInviteAction } from "@/lib/actions/team";
import type { AthleteInvite } from "@/lib/teams";

export default function TeamInvites({ invites }: { invites: AthleteInvite[] }) {
  if (invites.length === 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-4">
      <h3 className="font-display uppercase tracking-wide text-[13px] text-fg-muted">
        Team invites
      </h3>
      {invites.map((invite) => (
        <div
          key={invite.teamMemberId}
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line px-3 py-2.5"
        >
          <p className="font-body text-sm text-fg">
            <span className="font-semibold">{invite.coachName}</span> invited you to join{" "}
            <span className="font-semibold">{invite.teamName}</span>
            <span className="ml-1.5 font-data text-[11px] uppercase tracking-wide text-fg-faint">
              {invite.sportLabel}
            </span>
          </p>
          <div className="flex gap-2">
            <form action={respondToInviteAction}>
              <input type="hidden" name="teamMemberId" value={invite.teamMemberId} />
              <input type="hidden" name="decision" value="accept" />
              <button
                type="submit"
                className="rounded-md px-3 py-1.5 font-body text-[13px] font-semibold"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-accent-fg)",
                }}
              >
                Accept
              </button>
            </form>
            <form action={respondToInviteAction}>
              <input type="hidden" name="teamMemberId" value={invite.teamMemberId} />
              <input type="hidden" name="decision" value="decline" />
              <button
                type="submit"
                className="rounded-md border border-line-strong px-3 py-1.5 font-body text-[13px] font-semibold text-fg"
              >
                Decline
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
