"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, HeartPulse, CalendarClock, Video } from "lucide-react";

export default function BottomNav({ handle }: { handle: string }) {
  const pathname = usePathname();

  const items = [
    { label: "Home", icon: LayoutDashboard, href: `/athletes/${handle}/dashboard` },
    { label: "Profile", icon: User, href: `/athletes/${handle}` },
    { label: "Recovery", icon: HeartPulse, href: `/athletes/${handle}/recovery` },
    { label: "Training", icon: CalendarClock, href: `/athletes/${handle}/training` },
    { label: "Videos", icon: Video, href: `/athletes/${handle}/videos` },
  ];

  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-line bg-surface-raised/95 py-2 backdrop-blur-sm lg:hidden"
    >
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
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
