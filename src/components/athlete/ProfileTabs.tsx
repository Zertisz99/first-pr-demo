"use client";

import { useState, type ReactNode } from "react";

export type ProfileTab = {
  key: string;
  label: string;
  content: ReactNode;
};

export default function ProfileTabs({ tabs }: { tabs: ProfileTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Profile sections"
        className="flex gap-1 border-b border-line mb-6"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.key)}
              className={[
                "font-display uppercase tracking-wide text-[13px] px-3.5 py-2.5 -mb-px border-b-2 transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                isActive
                  ? "border-sport-live text-fg"
                  : "border-transparent text-fg-faint hover:text-fg-muted",
              ].join(" ")}
              style={
                {
                  "--tw-outline-color": "var(--color-accent)",
                } as React.CSSProperties
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div key={tab.key} role="tabpanel" hidden={tab.key !== active}>
          {tab.key === active && tab.content}
        </div>
      ))}
    </div>
  );
}
