import { Outlet, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useMaintenance } from "@/contexts/MaintenanceContext";

const ADMIN_ALLOWED_PATHS = ["/admin", "/terms"];

export function MaintenanceGate() {
  const { enabled } = useMaintenance();
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const allow =
    !enabled ||
    !!user ||
    ADMIN_ALLOWED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (allow) return <Outlet />;

  return (
    <div className="grid min-h-[70vh] place-items-center bg-secondary/40 px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 text-center shadow-elevated">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
          Maintenance
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-navy">
          Website temporarily unavailable
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Admin Daniyal has temporarily disabled this website.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The website is currently under maintenance. Please check back later.
        </p>
      </div>
    </div>
  );
}
