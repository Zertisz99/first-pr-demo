import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getNotifications } from "@/lib/notifications";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/lib/actions/notifications";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifications = await getNotifications(session.user.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg">
          Notifications
        </h1>
        {unreadCount > 0 && (
          <form action={markAllNotificationsReadAction}>
            <button
              type="submit"
              className="rounded-md border border-line-strong px-3 py-1.5 font-body text-[12.5px] font-semibold text-fg"
            >
              Mark all as read
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong p-10 text-center">
          <p className="font-body text-sm text-fg-muted">You&rsquo;re all caught up.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => {
            const content = (
              <div
                className="flex items-start justify-between gap-3 rounded-lg border border-line p-4"
                style={{
                  background: n.read ? "var(--color-surface-raised)" : "var(--color-surface-sunken)",
                }}
              >
                <div>
                  {!n.read && (
                    <span
                      className="mb-1 inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: "var(--color-accent)" }}
                    />
                  )}
                  <p className="font-body text-[13.5px] text-fg">{n.message}</p>
                  <p className="mt-0.5 font-data text-[10.5px] text-fg-faint">{n.createdAt}</p>
                </div>
                {!n.read && (
                  <form action={markNotificationReadAction}>
                    <input type="hidden" name="notificationId" value={n.id} />
                    <button
                      type="submit"
                      className="whitespace-nowrap font-body text-[12px] font-medium text-fg-muted hover:text-fg"
                    >
                      Mark read
                    </button>
                  </form>
                )}
              </div>
            );

            return n.link ? (
              <Link key={n.id} href={n.link}>
                {content}
              </Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
