import { useEffect, useState, type FormEvent } from "react";
import { describeDevice, logActivity } from "@/services/activityService";
import { getVisitorName, saveVisitorName, subscribeOwnVisitor } from "@/services/visitorService";

/** Required name prompt before using Training. Asked once per device unless an admin requests it again. */
export function VisitorNameGate() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!getVisitorName()) setOpen(true);
    return subscribeOwnVisitor((v) => { if (v?.askAgain) { setName(""); setOpen(true); } });
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const clean = name.trim();
    if (clean.length < 2) { setErr("Please enter your name (at least 2 characters)."); return; }
    setBusy(true); setErr(null);
    try {
      await saveVisitorName(clean, describeDevice());
      logActivity("Visitor named", `“${clean}”`);
      window.dispatchEvent(new Event("visitor:named"));
      setOpen(false);
    } catch (e2) {
      setErr((e2 as Error).message || "Could not save your name. Please try again.");
    } finally { setBusy(false); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-navy/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="visitor-name-title">
      <form onSubmit={submit} className="glass-panel w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-card">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">Training center</span>
        <h2 id="visitor-name-title" className="mt-1 font-display text-xl font-bold text-navy">Enter your name</h2>
        <p className="mt-1 text-xs text-muted-foreground">Required to access training resources. You'll only be asked once.</p>
        <input autoFocus value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="Your name"
          className="mt-4 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        <div className="mt-1 text-right text-[11px] text-muted-foreground">{name.length} / 40</div>
        {err && <p className="mt-2 break-words text-xs text-destructive">{err}</p>}
        <button type="submit" disabled={busy}
          className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition-colors hover:bg-primary/90 disabled:opacity-60">
          {busy ? "Saving…" : "Submit"}
        </button>
      </form>
    </div>
  );
}
