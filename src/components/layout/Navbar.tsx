import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import logoUrl from "@/assets/logo.png";

const links = [
  { to: "/", label: "Home" },
  { to: "/fleet", label: "Fleet" },
  { to: "/dispatch", label: "Dispatch" },
  { to: "/loads", label: "Loads" },
  { to: "/operations", label: "Operations" },
  { to: "/reports", label: "Reports" },
  { to: "/training", label: "Training" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reducedMotion = useReducedMotion();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container-max flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white ring-1 ring-border shadow-card transition-transform group-hover:scale-105 overflow-hidden">
            <img src={logoUrl} alt="Trucking-1 logo" width={44} height={44} className="h-9 w-9 object-contain" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg font-bold tracking-tight text-navy">TRUCKING-1</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Freight Ops Portal
            </span>
          </div>
        </Link>

        <nav className="hidden xl:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "text-primary" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId={reducedMotion ? undefined : "nav-underline"}
                    transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-primary-gradient"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden xl:flex items-center gap-2">
          <Link
            to="/admin"
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-secondary"
          >
            Admin
          </Link>
          <Link
            to="/dispatch"
            className="rounded-lg bg-primary-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.02]"
          >
            Live Dispatch
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          className="xl:hidden grid h-10 w-10 place-items-center rounded-lg border border-border text-navy"
          aria-label="Toggle menu"
        >
          {open ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="xl:hidden overflow-hidden border-t border-border bg-background"
          >
            <div className="container-max flex flex-col gap-1 py-4">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                    pathname === l.to
                      ? "bg-secondary text-primary"
                      : "text-foreground/80 hover:bg-secondary"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-lg bg-navy px-3 py-3 text-center text-sm font-semibold text-navy-foreground"
              >
                Admin Portal
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
