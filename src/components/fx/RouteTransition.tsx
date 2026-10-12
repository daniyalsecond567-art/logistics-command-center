import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Cinematic route change: a freight-light sweep passes across the viewport
 * while the incoming page fades and lifts into place. Navigation itself is
 * untouched — this only animates the container.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [key, setKey] = useState(pathname);
  const [sweeping, setSweeping] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setKey(pathname);
    if (reducedMotion) {
      setSweeping(false);
      return;
    }
    setSweeping(true);
    const t = window.setTimeout(() => setSweeping(false), 760);
    return () => window.clearTimeout(t);
  }, [pathname, reducedMotion]);

  return (
    <>
      {sweeping && !reducedMotion && <div aria-hidden="true" className="fx-route-sweep" />}
      <div key={key} className="fx-page-enter">
        {children}
      </div>
    </>
  );
}
