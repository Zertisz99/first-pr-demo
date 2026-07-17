import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getNotifications } from "@/lib/notifications";
import { markAllNotificationsReadAction } from "@/lib/actions/notifications";
import NotificationList from "@/components/notifications/NotificationList";

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
        <NotificationList notifications={notifications} />
      )}
    </div>
  );
}
