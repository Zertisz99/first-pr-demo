"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarClock, Trophy, HeartPulse, Bandage } from "lucide-react";

export default function CoachBottomNav({ teamId }: { teamId: string }) {
  const pathname = usePathname();

  const items = [
    { label: "Home", icon: LayoutDashboard, href: `/coach/teams/${teamId}/dashboard` },
    { label: "Planner", icon: CalendarClock, href: `/coach/teams/${teamId}/planner` },
    { label: "Matches", icon: Trophy, href: `/coach/teams/${teamId}/matches` },
    { label: "Recovery", icon: HeartPulse, href: `/coach/teams/${teamId}/recovery` },
    { label: "Injuries", icon: Bandage, href: `/coach/teams/${teamId}/injuries` },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-line bg-surface-raised/95 py-2 backdrop-blur-sm lg:hidden">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-2 py-1 font-data text-[9.5px] uppercase tracking-wide"
            style={{ color: isActive ? "var(--color-accent)" : "var(--color-fg-faint)" }}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
