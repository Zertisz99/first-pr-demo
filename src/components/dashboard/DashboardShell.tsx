"use client";

import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardShell({
  handle,
  name,
  sportLabel,
  main,
  rightPanel,
}: {
  handle: string;
  name: string;
  sportLabel: string;
  main: ReactNode;
  rightPanel: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-4 sm:px-6 lg:px-8">
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
          <Sidebar handle={handle} name={name} sportLabel={sportLabel} />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-7">{main}</div>

        <div className="hidden lg:col-span-3 lg:block">{rightPanel}</div>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:hidden">{rightPanel}</div>
    </div>
  );
}
