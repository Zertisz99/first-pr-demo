"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  HeartPulse,
  CalendarClock,
  Trophy,
  Video,
  Users,
  BarChart3,
  MessageSquare,
  Bell,
  Settings,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href?: string;
};

export default function Sidebar({
  handle,
  name,
  sportLabel,
}: {
  handle: string;
  name: string;
  sportLabel: string;
}) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { label: "Player Profile", icon: LayoutDashboard, href: `/athletes/${handle}/dashboard` },
    { label: "Player Info", icon: User, href: `/athletes/${handle}` },
    { label: "Recovery Journal", icon: HeartPulse, href: `/athletes/${handle}/recovery` },
    { label: "Training Plans", icon: CalendarClock, href: `/athletes/${handle}/training` },
    { label: "Matches", icon: Trophy, href: `/athletes/${handle}/matches` },
    { label: "Videos", icon: Video, href: `/athletes/${handle}/videos` },
    { label: "Teams", icon: Users },
    { label: "Statistics", icon: BarChart3 },
    { label: "Messages", icon: MessageSquare },
    { label: "Notifications", icon: Bell, href: "/notifications" },
    { label: "Settings", icon: Settings },
  ];

  return (
    <aside className="flex h-full flex-col gap-6">
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-raised p-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold"
          style={{ background: "var(--color-sport-live)", color: "#fff" }}
        >
          {name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="min-w-0">
          <p className="truncate font-body text-sm font-semibold text-fg">{name}</p>
          <p className="font-data text-[10.5px] uppercase tracking-wide text-fg-faint">
            {sportLabel}
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive = item.href && pathname === item.href;
          const Icon = item.icon;

          if (!item.href) {
            return (
              <span
                key={item.label}
                className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 font-body text-[13px] text-fg-faint opacity-60"
              >
                <span className="flex items-center gap-2">
                  <Icon size={16} />
                  {item.label}
                </span>
                <span className="rounded-full border border-line px-1.5 py-0.5 font-data text-[9px] uppercase tracking-wide">
                  Soon
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 font-body text-[13px] font-medium transition-colors"
              style={
                isActive
                  ? { background: "var(--color-accent)", color: "var(--color-accent-fg)" }
                  : { color: "var(--color-fg-muted)" }
              }
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
