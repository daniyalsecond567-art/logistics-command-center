import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const SEEN_KEY = "trucking1.preloader.v1";

/**
 * Premium logistics boot sequence shown once per browser session.
 * Renders nothing on the server and never blocks the app: content mounts
 * underneath immediately and the overlay fades away on its own.
 */
export function Preloader() {
  const [active, setActive] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    let seen = true;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }

    setActive(true);
    const t1 = window.setTimeout(() => setLeaving(true), 1500);
    const t2 = window.setTimeout(() => setActive(false), 2250);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reducedMotion]);

  if (!active || reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className={`fx-preloader ${leaving ? "fx-preloader-out" : ""}`}
    >
      <div className="fx-grid absolute inset-0 opacity-25" />
      <div className="relative flex w-full max-w-sm flex-col items-center px-6">
        <div className="fx-blueprint">
          <span className="fx-blueprint-cab" />
          <span className="fx-blueprint-trailer" />
          <span className="fx-blueprint-wheel" style={{ left: "16%" }} />
          <span className="fx-blueprint-wheel" style={{ left: "62%" }} />
          <span className="fx-blueprint-wheel" style={{ left: "76%" }} />
        </div>
        <p className="mt-8 font-display text-sm font-bold uppercase tracking-[0.42em] text-navy-foreground">
          Trucking-1
        </p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-navy-foreground/50">
          Initializing dispatch grid
        </p>
        <div className="mt-6 h-[3px] w-full overflow-hidden rounded-full bg-navy-foreground/15">
          <span className="fx-preloader-bar" />
        </div>
      </div>
    </div>
  );
}
