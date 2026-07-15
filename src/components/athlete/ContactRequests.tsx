import { respondToContactRequestAction } from "@/lib/actions/scouting";
import type { PendingContactRequest } from "@/lib/scouting";

export default function ContactRequests({
  requests,
}: {
  requests: PendingContactRequest[];
}) {
  if (requests.length === 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-4">
      <h3 className="font-display uppercase tracking-wide text-[13px] text-fg-muted">
        Contact requests
      </h3>
      {requests.map((request) => (
        <div
          key={request.requestId}
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line px-3 py-2.5"
        >
          <p className="font-body text-sm text-fg">
            <span className="font-semibold">{request.clubName}</span> wants to connect
            <span className="mt-1 block text-[13px] text-fg-muted">{request.message}</span>
          </p>
          <div className="flex gap-2">
            <form action={respondToContactRequestAction}>
              <input type="hidden" name="requestId" value={request.requestId} />
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
            <form action={respondToContactRequestAction}>
              <input type="hidden" name="requestId" value={request.requestId} />
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
