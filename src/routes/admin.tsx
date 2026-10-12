import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSignOutAlt, FaTrash, FaPencilAlt, FaCloudUploadAlt, FaCheckCircle, FaTimesCircle, FaSearch } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import {
  createTraining,
  deleteTraining,
  listTraining,
  renameTraining,
  type TrainingAudio,
} from "@/services/trainingService";
import { uploadAudioBalanced } from "@/lib/uploadRouter";
import { decideRequest, deleteRequest, listHistoryRequests, listPendingRequests, type UserRequest } from "@/services/requestService";
import { FaCheck, FaTimes, FaPowerOff, FaLink } from "react-icons/fa";
import { formatBytes, formatDuration } from "@/utils/format";
import { setMaintenance } from "@/services/maintenanceService";
import { listSongs, renameSong, deleteSong, type TrainingSong } from "@/services/songService";
import { useMaintenance } from "@/contexts/MaintenanceContext";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Portal | Trucking-1" },
      { name: "description", content: "Trucking-1 administrator portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading, login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) {
    return <div className="container-max py-32 text-center text-muted-foreground">Verifying session…</div>;
  }

  if (!user) {
    return (
      <div className="container-max grid min-h-[70vh] place-items-center py-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elevated">
          <h1 className="font-display text-2xl font-bold text-navy">Admin Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in with your Trucking-1 administrator credentials.</p>
          <form
            onSubmit={async (e: FormEvent) => {
              e.preventDefault();
              setErr(null);
              setBusy(true);
              try {
                await login(email, password);
              } catch (e) {
                setErr((e as Error).message.replace("Firebase: ", ""));
              } finally {
                setBusy(false);
              }
            }}
            className="mt-6 space-y-4"
          >
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-navy">Email</span>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-navy">Password</span>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </label>
            {err && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{err}</div>}
            <button disabled={busy} className="w-full rounded-xl bg-primary-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.01] disabled:opacity-60">
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            Administrators are provisioned in the Firebase console. This portal never allows public sign-up.
          </p>
        </div>
      </div>
    );
  }

  return <AdminDashboard email={user.email ?? ""} onLogout={() => logout()} />;
}

interface Toast { kind: "ok" | "err"; msg: string }

function AdminDashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [items, setItems] = useState<TrainingAudio[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const refresh = async () => {
    setLoading(true);
    try {
      setItems(await listTraining());
    } catch (e) {
      setToast({ kind: "err", msg: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void refresh(); }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    if (!items) return [];
    const s = q.trim().toLowerCase();
    return s ? items.filter((i) => i.title.toLowerCase().includes(s)) : items;
  }, [items, q]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const shown = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bg-secondary/40">
      <div className="border-b border-border bg-card">
        <div className="container-max flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Admin</span>
            <h1 className="mt-1 font-display text-2xl font-bold text-navy">Training resources</h1>
            <p className="text-xs text-muted-foreground">Signed in as {email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MaintenanceToggle email={email} onError={(m) => setToast({ kind: "err", msg: m })} onOk={(m) => setToast({ kind: "ok", msg: m })} />
            <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-navy hover:bg-secondary">
              <FaSignOutAlt /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="container-max grid gap-6 py-10 lg:grid-cols-[1fr_1.5fr]">
        <UploadPanel onUploaded={async () => { await refresh(); setToast({ kind: "ok", msg: "Training resource uploaded." }); }} onError={(m) => setToast({ kind: "err", msg: m })} nextOrder={(items?.length ?? 0) + 1} />

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-navy">Existing briefs ({filtered.length})</h2>
            <div className="relative w-full max-w-xs">
              <FaSearch className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Search…"
                className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {loading && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-secondary/70" />
            ))}
            {!loading && shown.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No briefs match this filter.
              </div>
            )}
            {!loading && shown.map((it) => (
              <AudioRow
                key={it.id}
                item={it}
                onRenamed={async () => { await refresh(); setToast({ kind: "ok", msg: "Brief renamed." }); }}
                onDeleted={async () => { await refresh(); setToast({ kind: "ok", msg: "Brief deleted." }); }}
                onError={(m) => setToast({ kind: "err", msg: m })}
              />
            ))}
          </div>

          {pageCount > 1 && (
            <div className="mt-6 flex items-center justify-between text-sm">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40">Prev</button>
              <span className="text-muted-foreground">Page {page} of {pageCount}</span>
              <button disabled={page === pageCount} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </div>

      <div className="container-max pb-6">
        <SongsPanel onError={(m) => setToast({ kind: "err", msg: m })} onOk={(m) => setToast({ kind: "ok", msg: m })} />
      </div>

      <div className="container-max grid gap-6 pb-10 lg:grid-cols-2">
        <PendingPanel onError={(m) => setToast({ kind: "err", msg: m })} onOk={(m) => setToast({ kind: "ok", msg: m })} />
        <HistoryPanel onError={(m) => setToast({ kind: "err", msg: m })} onOk={(m) => setToast({ kind: "ok", msg: m })} />
      </div>


      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-elevated ${
              toast.kind === "ok" ? "bg-success text-white" : "bg-destructive text-white"
            }`}
          >
            {toast.kind === "ok" ? <FaCheckCircle /> : <FaTimesCircle />} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UploadPanel({ onUploaded, onError, nextOrder }: { onUploaded: () => Promise<void>; onError: (m: string) => void; nextOrder: number }) {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"file" | "url">("file");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setProgress(0);
    try {
      let audioUrl: string;
      let duration = 0;

      if (mode === "url") {
        const clean = url.trim();
        if (!/^https?:\/\/\S+$/i.test(clean)) throw new Error("Enter a valid http(s) audio link.");
        if (/youtube\.com|youtu\.be/i.test(clean))
          throw new Error("YouTube links can't be added. Paste a direct .mp3 / .m4a / .wav link.");
        audioUrl = clean;
      } else {
        if (!file) throw new Error("Choose an audio file first.");
        if (!file.type.startsWith("audio/")) throw new Error("Only audio files are supported.");
        const res = await uploadAudioBalanced(file, nextOrder - 1, setProgress);
        audioUrl = res.audioUrl;
        duration = res.duration;
      }

      await createTraining({
        title: title.trim(),
        description: desc.trim(),
        audioUrl,
        duration,
        displayOrder: nextOrder,
      });
      setFile(null); setUrl(""); setTitle(""); setDesc(""); setProgress(0);
      await onUploaded();
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-gradient text-primary-foreground"><FaCloudUploadAlt className="h-5 w-5" /></span>
        <div>
          <h2 className="font-display text-lg font-bold text-navy">Upload new brief</h2>
          <p className="text-xs text-muted-foreground">Upload an audio file or add one by link. Metadata is saved to Firestore.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-secondary/60 p-1">
        {(["file", "url"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              mode === m ? "bg-card text-navy shadow-card" : "text-muted-foreground hover:text-navy"
            }`}
          >
            {m === "file" ? <><FaCloudUploadAlt className="h-3.5 w-3.5" /> Upload file</> : <><FaLink className="h-3 w-3" /> Enter URL</>}
          </button>
        ))}
      </div>

      {mode === "url" ? (
        <label className="mt-4 block text-sm">
          <span className="mb-1 block font-medium text-navy">Audio link</span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/brief.mp3"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <span className="mt-1 block text-xs text-muted-foreground">Direct .mp3 / .m4a / .wav link. YouTube links are not supported.</span>
        </label>
      ) : (
        <label
          htmlFor="file"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
          className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/40 p-8 text-center transition-colors hover:border-primary hover:bg-secondary"
        >
          <FaCloudUploadAlt className="h-8 w-8 text-primary" />
          <div className="text-sm font-semibold text-navy">{file ? file.name : "Drag MP3 here or click to browse"}</div>
          <div className="text-xs text-muted-foreground">{file ? formatBytes(file.size) : "MP3, M4A, WAV, OGG"}</div>
          <input id="file" type="file" accept="audio/*" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
      )}


      <label className="mt-4 block text-sm">
        <span className="mb-1 flex items-center justify-between font-medium text-navy">
          <span>Title</span>
          <span className="text-xs font-normal text-muted-foreground">{title.length} / 10</span>
        </span>
        <input required maxLength={10} value={title} onChange={(e) => setTitle(e.target.value.slice(0, 10))} placeholder="Brief 001" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      </label>
      <label className="mt-3 block text-sm">
        <span className="mb-1 flex items-center justify-between font-medium text-navy">
          <span>Note <span className="font-normal text-muted-foreground">(optional)</span></span>
          <span className="text-xs font-normal text-muted-foreground">{desc.length} / 10</span>
        </span>
        <textarea maxLength={10} value={desc} onChange={(e) => setDesc(e.target.value.slice(0, 10))} rows={2} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      </label>

      {busy && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary-gradient transition-[width]" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Uploading… {progress}%</div>
        </div>
      )}

      <button disabled={busy} className="mt-5 w-full rounded-xl bg-primary-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.01] disabled:opacity-60">
        {busy ? "Uploading…" : "Upload brief"}
      </button>
    </form>
  );
}

function AudioRow({ item, onRenamed, onDeleted, onError }: {
  item: TrainingAudio;
  onRenamed: () => Promise<void>;
  onDeleted: () => Promise<void>;
  onError: (m: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [desc, setDesc] = useState(item.description);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try { await renameTraining(item.id, title, desc); setEditing(false); await onRenamed(); }
    catch (e) { onError((e as Error).message); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setBusy(true);
    try { await deleteTraining(item.id); await onDeleted(); }
    catch (e) { onError((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4">
      {editing ? (
        <div className="space-y-2">
          <div>
            <input maxLength={10} value={title} onChange={(e) => setTitle(e.target.value.slice(0, 10))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <div className="mt-1 text-right text-[11px] text-muted-foreground">{title.length} / 10</div>
          </div>
          <div>
            <textarea maxLength={10} value={desc} onChange={(e) => setDesc(e.target.value.slice(0, 10))} rows={2} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <div className="mt-1 text-right text-[11px] text-muted-foreground">{desc.length} / 10</div>
          </div>
          <div className="flex gap-2">
            <button disabled={busy} onClick={save} className="rounded-lg bg-primary-gradient px-3 py-1.5 text-xs font-semibold text-primary-foreground">Save</button>
            <button onClick={() => { setEditing(false); setTitle(item.title); setDesc(item.description); }} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-navy">{item.title}</div>
            <div className="mt-0.5 truncate text-xs text-muted-foreground">
              {item.description || "—"} · {formatDuration(item.duration)}
            </div>
            <audio controls preload="none" src={item.audioUrl} className="mt-2 h-8 w-full max-w-md" />
          </div>
          <div className="flex shrink-0 gap-2">
            <button onClick={() => setEditing(true)} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-navy hover:bg-secondary" aria-label="Rename"><FaPencilAlt className="h-3.5 w-3.5" /></button>
            <button disabled={busy} onClick={remove} className="grid h-9 w-9 place-items-center rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10" aria-label="Delete"><FaTrash className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function PendingPanel({ onError, onOk }: { onError: (m: string) => void; onOk: (m: string) => void }) {
  const [items, setItems] = useState<UserRequest[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try { setItems(await listPendingRequests()); }
    catch (e) { onError((e as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => { void refresh(); }, []);

  const decide = async (id: string, decision: "Approved" | "Declined") => {
    setBusyId(id);
    setItems((prev) => (prev ? prev.filter((r) => r.id !== id) : prev)); // optimistic
    try {
      await decideRequest(id, decision);
      onOk(`Request ${decision.toLowerCase()}.`);
      window.dispatchEvent(new CustomEvent("requests:history-refresh"));
    } catch (e) {
      onError((e as Error).message);
      await refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-navy">User Requests <span className="text-muted-foreground">({items?.length ?? 0})</span></h2>
          <p className="text-xs text-muted-foreground">Pending requests submitted from the Training page.</p>
        </div>
        <button onClick={refresh} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-navy hover:bg-secondary">Refresh</button>
      </div>

      <div className="mt-4 space-y-2">
        {loading && Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary/70" />
        ))}
        {!loading && items && items.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No pending requests.
          </div>
        )}
        {!loading && items && items.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-navy" title={r.text}>{r.text}</div>
              <div className="text-[11px] text-muted-foreground">
                {r.createdAt?.toDate?.().toLocaleString() ?? "—"} · <span className="font-semibold text-amber-600">{r.status}</span>
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button
                disabled={busyId === r.id}
                onClick={() => decide(r.id, "Approved")}
                className="inline-flex items-center gap-1 rounded-lg border border-success/30 bg-success/10 px-2.5 py-1.5 text-xs font-semibold text-success hover:bg-success/20 disabled:opacity-50"
                aria-label="Approve"
              >
                <FaCheck className="h-3 w-3" /> Approve
              </button>
              <button
                disabled={busyId === r.id}
                onClick={() => decide(r.id, "Declined")}
                className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 disabled:opacity-50"
                aria-label="Decline"
              >
                <FaTimes className="h-3 w-3" /> Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryPanel({ onError, onOk }: { onError: (m: string) => void; onOk: (m: string) => void }) {
  const [items, setItems] = useState<UserRequest[] | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try { setItems(await listHistoryRequests()); }
    catch (e) { onError((e as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => { void refresh(); }, []);
  useEffect(() => {
    const h = () => { void refresh(); };
    window.addEventListener("requests:history-refresh", h);
    return () => window.removeEventListener("requests:history-refresh", h);
  }, []);

  const remove = async (id: string) => {
    const prev = items;
    setItems((p) => (p ? p.filter((r) => r.id !== id) : p));
    try { await deleteRequest(id); onOk("History entry deleted."); }
    catch (e) { onError((e as Error).message); setItems(prev); }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-navy">Request History <span className="text-muted-foreground">({items?.length ?? 0})</span></h2>
          <p className="text-xs text-muted-foreground">Approved and declined requests. Newest first.</p>
        </div>
        <button onClick={refresh} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-navy hover:bg-secondary">Refresh</button>
      </div>

      <div className="mt-4 space-y-2">
        {loading && Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary/70" />
        ))}
        {!loading && items && items.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No decisions yet.
          </div>
        )}
        {!loading && items && items.map((r) => {
          const decidedTs = r.decidedAt?.toDate?.() ?? r.createdAt?.toDate?.();
          const isApproved = r.status === "Approved";
          return (
            <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-navy" title={r.text}>{r.text}</div>
                <div className="text-[11px] text-muted-foreground">
                  {decidedTs?.toLocaleString() ?? "—"} ·{" "}
                  <span className={`font-semibold ${isApproved ? "text-success" : "text-destructive"}`}>{r.status}</span>
                </div>
              </div>
              <button onClick={() => remove(r.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10" aria-label="Delete">
                <FaTrash className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}



function MaintenanceToggle({ email, onError, onOk }: { email: string; onError: (m: string) => void; onOk: (m: string) => void }) {
  const { enabled } = useMaintenance();
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    const next = !enabled;
    if (next && !confirm("Enable Maintenance Mode? The public website will be disabled for non-admin visitors.")) return;
    setBusy(true);
    try {
      await setMaintenance(next, email);
      onOk(next ? "Maintenance Mode enabled." : "Maintenance Mode disabled.");
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
        enabled
          ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
          : "border-border bg-card text-navy hover:bg-secondary"
      }`}
      aria-pressed={enabled}
      title={enabled ? "Maintenance Mode is ON — click to disable" : "Maintenance Mode is OFF — click to enable"}
    >
      <FaPowerOff className="h-3.5 w-3.5" />
      Maintenance: {enabled ? "ON" : "OFF"}
    </button>
  );
}

function SongsPanel({ onError, onOk }: { onError: (m: string) => void; onOk: (m: string) => void }) {
  const [items, setItems] = useState<TrainingSong[] | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try { setItems(await listSongs()); } catch (e) { onError((e as Error).message); setItems([]); }
  };
  useEffect(() => { void load(); }, []);

  const save = async (id: string) => {
    setBusyId(id);
    try { await renameSong(id, draft); setItems((p) => p?.map((s) => (s.id === id ? { ...s, title: draft.trim() } : s)) ?? p); setEditId(null); onOk("Song renamed."); }
    catch (e) { onError((e as Error).message); }
    finally { setBusyId(null); }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this song?")) return;
    setBusyId(id);
    try { await deleteSong(id); setItems((p) => p?.filter((s) => s.id !== id) ?? p); onOk("Song deleted."); }
    catch (e) { onError((e as Error).message); }
    finally { setBusyId(null); }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-lg font-bold text-navy">YouTube songs <span className="text-muted-foreground">({items?.length ?? 0})</span></h2>
      <div className="mt-4 space-y-2">
        {!items && <div className="h-14 animate-pulse rounded-lg bg-secondary/70" />}
        {items && items.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No songs added yet.</div>
        )}
        {items?.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              {editId === s.id ? (
                <input autoFocus maxLength={60} value={draft} onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") void save(s.id); if (e.key === "Escape") setEditId(null); }}
                  className="w-full rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary" />
              ) : (
                <div className="truncate text-sm font-semibold text-navy" title={s.title}>{s.title}</div>
              )}
              <a href={s.sourceUrl} target="_blank" rel="noreferrer" className="block truncate text-xs text-muted-foreground hover:text-primary">{s.sourceUrl}</a>
            </div>
            <div className="flex shrink-0 gap-2">
              {editId === s.id ? (
                <>
                  <button disabled={busyId === s.id} onClick={() => save(s.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-success/30 text-success hover:bg-success/10" aria-label="Save"><FaCheck className="h-3.5 w-3.5" /></button>
                  <button onClick={() => setEditId(null)} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-navy hover:bg-secondary" aria-label="Cancel"><FaTimes className="h-3.5 w-3.5" /></button>
                </>
              ) : (
                <button onClick={() => { setEditId(s.id); setDraft(s.title); }} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-navy hover:bg-secondary" aria-label="Rename"><FaPencilAlt className="h-3.5 w-3.5" /></button>
              )}
              <button disabled={busyId === s.id} onClick={() => remove(s.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10" aria-label="Delete"><FaTrash className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
