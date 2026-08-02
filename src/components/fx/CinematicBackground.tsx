import { useMotionTier } from "@/hooks/useMotionTier";

/**
 * Fixed, non-interactive ambient layer: freight corridors, drifting cargo
 * lights and a slow scanning horizon. Sits behind all content.
 */
export function CinematicBackground() {
  const tier = useMotionTier();
  if (tier === "minimal") return null;

  const lanes = tier === "full" ? 5 : 3;
  const motes = tier === "full" ? 14 : 6;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ contain: "strict" }}
    >
      {/* depth gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_-10%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_60%),radial-gradient(ellipse_at_85%_110%,color-mix(in_oklab,var(--accent)_10%,transparent),transparent_55%)]" />

      {/* logistics grid */}
      <div className="fx-grid absolute inset-0 opacity-[0.35]" />

      {/* freight corridors */}
      {Array.from({ length: lanes }).map((_, i) => (
        <span
          key={`lane-${i}`}
          className="fx-lane"
          style={{
            top: `${12 + i * 18}%`,
            animationDuration: `${13 + i * 4}s`,
            animationDelay: `${i * 2.4}s`,
            opacity: 0.35 - i * 0.04,
          }}
        />
      ))}

      {/* floating cargo motes */}
      {Array.from({ length: motes }).map((_, i) => (
        <span
          key={`mote-${i}`}
          className="fx-mote"
          style={{
            left: `${(i * 97) % 100}%`,
            top: `${(i * 61) % 100}%`,
            animationDuration: `${16 + (i % 6) * 5}s`,
            animationDelay: `${-i * 1.7}s`,
          }}
        />
      ))}
    </div>
  );
}
