"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Trophy,
  Video,
  HeartPulse,
  Bandage,
  BarChart3,
  CalendarDays,
  Megaphone,
  ListOrdered,
  UserCog,
  Images,
  ExternalLink,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
  external?: boolean;
};

export default function CoachSidebar({
  teamId,
  teamSlug,
  teamName,
  sportLabel,
}: {
  teamId: string;
  teamSlug: string;
  teamName: string;
  sportLabel: string;
}) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { label: "Dashboard", icon: LayoutDashboard, href: `/coach/teams/${teamId}/dashboard` },
    { label: "Roster", icon: Users, href: `/coach` },
    { label: "Planner", icon: CalendarClock, href: `/coach/teams/${teamId}/planner` },
    { label: "Matches", icon: Trophy, href: `/coach/teams/${teamId}/matches` },
    { label: "Videos", icon: Video, href: `/coach/teams/${teamId}/videos` },
    { label: "Recovery", icon: HeartPulse, href: `/coach/teams/${teamId}/recovery` },
    { label: "Injuries", icon: Bandage, href: `/coach/teams/${teamId}/injuries` },
    { label: "Compare", icon: BarChart3, href: `/coach/teams/${teamId}/compare` },
    { label: "Calendar", icon: CalendarDays, href: `/coach/teams/${teamId}/calendar` },
    { label: "Announcements", icon: Megaphone, href: `/coach/teams/${teamId}/announcements` },
    { label: "League Table", icon: ListOrdered, href: `/coach/teams/${teamId}/standings` },
    { label: "Staff", icon: UserCog, href: `/coach/teams/${teamId}/staff` },
    { label: "Gallery", icon: Images, href: `/coach/teams/${teamId}/gallery` },
    { label: "Public Page", icon: ExternalLink, href: `/teams/${teamSlug}` },
  ];

  return (
    <aside className="flex h-full flex-col gap-6">
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-raised p-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold"
          style={{ background: "var(--color-sport-live)", color: "#fff" }}
        >
          {teamName
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="min-w-0">
          <p className="truncate font-body text-sm font-semibold text-fg">{teamName}</p>
          <p className="font-data text-[10.5px] uppercase tracking-wide text-fg-faint">
            {sportLabel}
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
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
