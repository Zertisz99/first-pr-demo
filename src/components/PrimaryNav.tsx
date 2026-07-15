"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  HeartPulse,
  Video,
  User,
  Building2,
} from "lucide-react";
import type { UserRole } from "@/generated/prisma/client";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  // Hidden below `lg` because the global bottom tab bar (BottomNav) already
  // covers this destination on small screens — showing both is redundant.
  mobileHidden?: boolean;
};

export default function PrimaryNav({
  role,
  athleteHandle,
}: {
  role: UserRole | undefined;
  athleteHandle?: string | null;
}) {
  const pathname = usePathname();

  const items: NavItem[] = [{ label: "Discover", href: "/discover", icon: Search }];

  if (role === "athlete" && athleteHandle) {
    items.push(
      {
        label: "Player Profile",
        href: `/athletes/${athleteHandle}/dashboard`,
        icon: LayoutDashboard,
        mobileHidden: true,
      },
      {
        label: "Recovery",
        href: `/athletes/${athleteHandle}/recovery`,
        icon: HeartPulse,
        mobileHidden: true,
      },
      {
        label: "My videos",
        href: `/athletes/${athleteHandle}/videos`,
        icon: Video,
        mobileHidden: true,
      },
      {
        label: "Player Info",
        href: `/athletes/${athleteHandle}`,
        icon: User,
        mobileHidden: true,
      },
    );
  }

  if (role === "coach") {
    items.push({ label: "Coach dashboard", href: "/coach", icon: LayoutDashboard });
  }

  if (role === "club") {
    items.push({ label: "Club dashboard", href: "/club", icon: Building2 });
  }

  return (
    <nav
      aria-label="Primary"
      className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`${item.mobileHidden ? "hidden lg:flex" : "flex"} shrink-0 items-center gap-1.5 rounded-full px-3 py-2 font-body text-sm font-medium transition-colors hover:bg-surface-raised`}
            style={
              isActive
                ? { background: "var(--color-accent)", color: "var(--color-accent-fg)" }
                : { color: "var(--color-fg)" }
            }
          >
            <Icon size={16} className="shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
