import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaPlay, FaPause, FaHeadphonesAlt, FaSearch, FaClipboardList, FaPlus, FaTimes, FaCheckCircle, FaExclamationTriangle, FaHeart, FaRegHeart } from "react-icons/fa";
import { PageHeader } from "@/components/layout/PageHeader";
import { listTraining, type TrainingAudio } from "@/services/trainingService";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useFavourites } from "@/hooks/useFavourites";
import { createRequest, createIssue } from "@/services/requestService";


export const Route = createFileRoute("/training")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Driver Training Center | Trucking-1" },
      { name: "description", content: "Driver safety, orientation and operations training briefs." },
    ],
  }),
  component: TrainingPage,
});

function TrainingPage() {
  const [items, setItems] = useState<TrainingAudio[] | null>(null);
  const [showRequest, setShowRequest] = useState(false);
  const [showIssue, setShowIssue] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "favs">("all");
  const { favourites, isFavourite, toggle } = useFavourites();

  useEffect(() => {
    let alive = true;
    listTraining()
      .then((rows) => alive && setItems(rows))
      .catch((e) => alive && setError((e as Error).message));
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!items) return null;
    let list = tab === "favs" ? items.filter((i) => favourites.has(i.id)) : items;
    const s = q.trim().toLowerCase();
    if (s) list = list.filter((i) => i.title.toLowerCase().includes(s) || i.description.toLowerCase().includes(s));
    return list;
  }, [items, q, tab, favourites]);

  return (
    <div>
      <PageHeader
        eyebrow="Training"
        title="Driver training center."
        description="Company briefs covering safety, orientation, dispatch communication and emergency procedures."
      />
      <section className="container-max py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FaClipboardList /> Internal driver resources — for company personnel only.
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-card">
            {([["all", "All"], ["favs", "Favourites"]] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  tab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-navy"
                }`}
              >
                {key === "favs" && <FaHeart className="h-3 w-3" />}
                {label}
                {key === "favs" && favourites.size > 0 && <span>({favourites.size})</span>}
              </button>
            ))}
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
              <FaSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search briefs..."
                className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowRequest(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-card transition-colors hover:bg-primary/90"
            >
              <FaPlus className="h-3 w-3" /> Add Request
            </button>
            <button
              type="button"
              onClick={() => setShowIssue(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-navy shadow-card transition-colors hover:bg-secondary"
            >
              <FaExclamationTriangle className="h-3 w-3" /> Report an Issue
            </button>
          </div>
        </div>


        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load training resources: {error}
          </div>
        )}

        {!filtered && !error && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg border border-border bg-card" />
            ))}
          </div>
        )}

        {filtered && filtered.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-card">
            {tab === "favs" ? (
              <>
                <FaRegHeart className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-3 font-display text-base font-bold text-navy">No favourites yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any brief to save it here.</p>
              </>
            ) : (
              <>
                <FaHeadphonesAlt className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-3 font-display text-base font-bold text-navy">No briefs yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Admins can upload briefs from the <a href="/admin" className="font-semibold text-primary">Admin Portal</a>.
                </p>
              </>
            )}
          </div>
        )}

        {filtered && filtered.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((t) => (
              <BriefCard key={t.id} item={t} favourite={isFavourite(t.id)} onToggleFav={() => toggle(t.id)} />
            ))}
          </div>
        )}
      </section>
      {showRequest && <RequestModal onClose={() => setShowRequest(false)} />}
      {showIssue && <IssueModal onClose={() => setShowIssue(false)} />}
    </div>
  );
}

function RequestModal({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const lastSubmitRef = useRef(0);

  const submit = async () => {
    const clean = text.trim();
    if (!clean) { setErr("Please enter a request."); return; }
    const now = Date.now();
    if (now - lastSubmitRef.current < 2000) { setErr("Please wait a moment before submitting again."); return; }
    lastSubmitRef.current = now;
    setBusy(true); setErr(null);
    try {
      await createRequest(clean);
      setDone(true);
      setTimeout(onClose, 1200);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-navy">New request</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary" aria-label="Close">
            <FaTimes className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Send a short request to the training team.</p>

        {done ? (
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-success/10 p-4 text-sm font-semibold text-success">
            <FaCheckCircle /> Request submitted.
          </div>
        ) : (
          <>
            <label className="mt-5 block text-sm">
              <span className="mb-1 flex items-center justify-between font-medium text-navy">
                <span>Request</span>
                <span className="text-xs font-normal text-muted-foreground">{text.length} / 20</span>
              </span>
              <input
                autoFocus
                maxLength={20}
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 20))}
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                placeholder="e.g. Add HOS brief"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            {err && <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">{err}</div>}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-navy hover:bg-secondary">Cancel</button>
              <button disabled={busy || !text.trim()} onClick={submit} className="rounded-lg bg-primary-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card disabled:opacity-60">
                {busy ? "Submitting…" : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function IssueModal({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const MAX = 300;

  const submit = async () => {
    const clean = text.trim();
    if (!clean) { setErr("Please describe the issue."); return; }
    setBusy(true); setErr(null);
    try {
      await createIssue(clean);
      setDone(true);
      setTimeout(onClose, 1200);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-navy">Report an issue</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary" aria-label="Close">
            <FaTimes className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Describe the problem you ran into.</p>
        {done ? (
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-success/10 p-4 text-sm font-semibold text-success">
            <FaCheckCircle /> Issue reported. Thank you.
          </div>
        ) : (
          <>
            <label className="mt-5 block text-sm">
              <span className="mb-1 flex items-center justify-between font-medium text-navy">
                <span>Issue</span>
                <span className="text-xs font-normal text-muted-foreground">{text.length} / {MAX}</span>
              </span>
              <input
                autoFocus
                maxLength={MAX}
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX))}
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                placeholder="e.g. Brief won't play"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            {err && <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">{err}</div>}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-navy hover:bg-secondary">Cancel</button>
              <button disabled={busy || !text.trim()} onClick={submit} className="rounded-lg bg-primary-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card disabled:opacity-60">
                {busy ? "Submitting…" : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BriefCard({ item }: { item: TrainingAudio }) {
  const { playing, toggle } = useAudioPlayer(item.audioUrl);

  return (
    <article className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 shadow-card transition-colors hover:border-primary/40">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-navy/5 text-navy">
        <FaClipboardList className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Brief</span>
        </div>
        <div className="truncate text-sm font-semibold text-navy" title={item.title}>{item.title}</div>
        {item.description && (
          <div className="truncate text-[11px] text-muted-foreground" title={item.description}>{item.description}</div>
        )}
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${
          playing ? "bg-navy text-navy-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {playing ? <FaPause className="h-3 w-3" /> : <FaPlay className="ml-0.5 h-3 w-3" />}
      </button>
    </article>
  );
}
