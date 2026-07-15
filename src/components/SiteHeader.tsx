import Link from "next/link";
import { auth } from "@/auth";
import { logOutAction } from "@/lib/actions/auth";
import { getUnreadNotificationCount } from "@/lib/notifications";
import PrimaryNav from "@/components/PrimaryNav";

export default async function SiteHeader() {
  const session = await auth();
  const unreadCount = session?.user
    ? await getUnreadNotificationCount(session.user.id)
    : 0;

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="font-display text-lg font-bold uppercase tracking-wide text-fg">
            Athleticore
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-6">
          <div className="w-full sm:w-auto">
            <PrimaryNav
              role={session?.user?.role}
              athleteHandle={session?.user?.athleteHandle}
            />
          </div>
          <Link
            href="/athletes/amara-okafor"
            className="hidden font-body text-sm font-medium text-fg-muted hover:text-fg sm:inline"
          >
            Demo profile
          </Link>

          {session?.user ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Link
                href="/notifications"
                className="relative font-body text-sm font-medium text-fg-muted hover:text-fg"
              >
                Notifications
                {unreadCount > 0 && (
                  <span
                    className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-data text-[10px] font-semibold"
                    style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
              <span className="font-body text-sm text-fg-muted">
                <span className="font-semibold text-fg">{session.user.name}</span>
                <span className="ml-1.5 hidden font-data text-[10.5px] uppercase tracking-wide text-fg-faint sm:inline">
                  {session.user.role}
                </span>
              </span>
              <form action={logOutAction}>
                <button
                  id="logout-submit"
                  type="submit"
                  className="whitespace-nowrap rounded-md border border-line-strong px-4 py-2 font-body text-sm font-semibold text-fg"
                >
                  Log out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Link
                href="/login"
                className="font-body text-sm font-medium text-fg-muted hover:text-fg"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="whitespace-nowrap rounded-md px-4 py-2 font-body text-sm font-semibold"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-accent-fg)",
                }}
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
