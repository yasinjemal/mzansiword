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
}: {
  held: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(held, SHIELD_CAP));
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${clamped} of ${SHIELD_CAP} streak shields`}
    >
      {Array.from({ length: SHIELD_CAP }, (_, i) =>
        i < clamped ? (
          <ShieldIcon key={i} className="h-4 w-4 text-brand" />
        ) : (
          <ShieldEmptyIcon key={i} className="h-4 w-4 text-muted/60" />
        ),
      )}
    </span>
  );
}
