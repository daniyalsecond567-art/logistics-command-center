import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Lightweight scroll reveal built on IntersectionObserver + CSS transforms.
 * Purely visual: content renders immediately for SSR/SEO and is only
 * transitioned in once visible.
 */
export function Reveal({ children, delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      data-revealed={shown ? "true" : "false"}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translate3d(0, 22px, 0)",
        transition: `opacity 700ms cubic-bezier(.16,1,.3,1) ${delay}ms, transform 700ms cubic-bezier(.16,1,.3,1) ${delay}ms`,
        willChange: shown ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
