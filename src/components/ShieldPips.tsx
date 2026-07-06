import { SHIELD_CAP } from "@/lib/streak/streak";
import { ShieldIcon, ShieldEmptyIcon } from "./icons";

/**
 * Streak-shield indicator (RFC-0002 B1). Shows all SHIELD_CAP slots — held
 * shields are solid, spent ones are hollow outlines — so state is legible
 * without relying on colour (ACCESSIBILITY.md). The row carries a text label
 * for screen readers; the icons themselves are aria-hidden.
 */
export function ShieldPips({
  held,
  className = "",
  size = "sm",
}: {
  held: number;
  className?: string;
  size?: "sm" | "lg";
}) {
  const clamped = Math.max(0, Math.min(held, SHIELD_CAP));
  const icon = size === "lg" ? "h-7 w-7" : "h-4 w-4";
  return (
    <span
      className={`inline-flex items-center ${size === "lg" ? "gap-1.5" : "gap-0.5"} ${className}`}
      role="img"
      aria-label={`${clamped} of ${SHIELD_CAP} streak shields`}
    >
      {Array.from({ length: SHIELD_CAP }, (_, i) =>
        i < clamped ? (
          <ShieldIcon key={i} className={`${icon} text-brand`} />
        ) : (
          <ShieldEmptyIcon key={i} className={`${icon} text-muted/60`} />
        ),
      )}
    </span>
  );
}
