"use client";

import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import CoachSidebar from "@/components/coach/CoachSidebar";
import CoachBottomNav from "@/components/coach/CoachBottomNav";

export default function CoachDashboardShell({
  teamId,
  teamSlug,
  teamName,
  sportLabel,
  main,
  rightPanel,
}: {
  teamId: string;
  teamSlug: string;
  teamName: string;
  sportLabel: string;
  main: ReactNode;
  rightPanel: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-10">
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className="rounded-md border border-line-strong p-2 text-fg"
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-6">
        <div className={`${sidebarOpen ? "mb-4 block" : "hidden"} lg:col-span-2 lg:mb-0 lg:block`}>
          <CoachSidebar
            teamId={teamId}
            teamSlug={teamSlug}
            teamName={teamName}
            sportLabel={sportLabel}
          />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-7">{main}</div>

        <div className="hidden lg:col-span-3 lg:block">{rightPanel}</div>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:hidden">{rightPanel}</div>

      <CoachBottomNav teamId={teamId} />
    </div>
  );
}
