import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { FaTimes, FaShieldAlt } from "react-icons/fa";

const STORAGE_KEY = "trucking1.termsAccepted.v1";

export function TermsGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const close = () => {
    try { localStorage.setItem(STORAGE_KEY, new Date().toISOString()); } catch { /* ignore */ }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-navy/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-gate-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-elevated">
        <div className="flex items-start justify-between gap-3 border-b border-border bg-secondary/40 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-gradient text-primary-foreground">
              <FaShieldAlt className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Notice</span>
              <h2 id="terms-gate-title" className="truncate font-display text-lg font-bold text-navy">
                Terms & Conditions
              </h2>
            </div>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-navy"
          >
            <FaTimes className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-5 text-sm leading-relaxed text-foreground sm:px-6">
          <p className="font-semibold text-navy">
            This website is a personal demonstration project.
          </p>
          <p className="mt-2 text-muted-foreground">
            Trucking-1 is created for learning, UI demonstration, and entertainment purposes only.
            It is <strong className="text-navy">not</strong> an official trucking, logistics,
            freight, dispatch, transportation, or fleet management platform.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>No real dispatching, freight booking, carrier operations, or transportation services are provided.</li>
            <li>All names, trucks, driver briefs, fleet statistics, and training materials are fictional or for demonstration only.</li>
            <li>The website must not be relied upon for any real business operation.</li>
            <li>The creators accept no responsibility for any misuse of this demonstration website.</li>
          </ul>
          <p className="mt-3 text-muted-foreground">
            By continuing, you acknowledge that this is a demo application created for educational
            and entertainment purposes. Read the full{" "}
            <Link to="/terms" onClick={close} className="font-semibold text-primary hover:underline">
              Terms & Conditions
            </Link>.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border bg-secondary/30 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            onClick={close}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-secondary"
          >
            Close
          </button>
          <button
            onClick={close}
            className="rounded-lg bg-primary-gradient px-5 py-2 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.01]"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
