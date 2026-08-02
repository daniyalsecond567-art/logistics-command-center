import { useEffect, useState } from "react";

export type MotionTier = "full" | "reduced" | "minimal";

/**
 * Detects device capability so heavy cinematic effects only run where they
 * make sense. Purely presentational — no app logic depends on this.
 */
export function useMotionTier(): MotionTier {
  const [tier, setTier] = useState<MotionTier>("minimal");

  useEffect(() => {
    const compute = (): MotionTier => {
      if (typeof window === "undefined") return "minimal";
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "minimal";

      const w = window.innerWidth;
      const cores = (navigator as Navigator & { hardwareConcurrency?: number })
        .hardwareConcurrency ?? 4;
      const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;

      if (w < 768 || cores <= 4 || mem <= 2) return "minimal";
      if (w < 1280 || cores <= 6) return "reduced";
      return "full";
    };

    const update = () => setTier(compute());
    update();

    window.addEventListener("resize", update, { passive: true });
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      mq.removeEventListener("change", update);
    };
  }, []);

  return tier;
}
