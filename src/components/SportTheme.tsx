import type { ReactNode } from "react";
import type { SportKey } from "@/lib/sports";

/**
 * Scopes a subtree to one sport's accent color. Everything inside that
 * reads `var(--color-sport-live)` (see globals.css [data-sport] rules)
 * picks up this sport's color via the CSS cascade — no color values are
 * computed or threaded through props.
 */
export default function SportTheme({
  sport,
  children,
  className,
}: {
  sport: SportKey;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-sport={sport} className={className}>
      {children}
    </div>
  );
}
