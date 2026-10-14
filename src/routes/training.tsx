import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaPlay, FaPause, FaHeadphonesAlt, FaSearch, FaClipboardList, FaPlus, FaTimes, FaCheckCircle, FaExclamationTriangle, FaHeart, FaRegHeart, FaMusic } from "react-icons/fa";
import { PageHeader } from "@/components/layout/PageHeader";
import { listTraining, type TrainingAudio } from "@/services/trainingService";
import { useAudioPlayer, pauseAllAudio, AUDIO_PLAY_EVENT } from "@/hooks/useAudioPlayer";
import { listSongs, addSong, parseYouTubeId, type TrainingSong } from "@/services/songService";

const SONG_PLAY_EVENT = "trucking1:song-play";
import { useFavourites } from "@/hooks/useFavourites";
import { createRequest, createIssue } from "@/services/requestService";


export const Route = createFileRoute("/training")({
  ssr: false,
  head: () => ({
    meta: [
      { property: "og:title", content: "Driver Training Center | Trucking-1" },
      { property: "og:description", content: "Driver safety, orientation and operations training briefs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const [showSong, setShowSong] = useState(false);
  const [songs, setSongs] = useState<TrainingSong[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "favs">("all");
  const { favourites, isFavourite, toggle } = useFavourites();

  useEffect(() => {
    let alive = true;
    listTraining()
      .then((rows) => alive && setItems(rows))
      .catch((e) => alive && setError((e as Error).message));
    listSongs()
      .then((rows) => alive && setSongs(rows))
      .catch((e) => console.warn("Songs failed to load:", (e as Error).message));
    return () => { alive = false; };
  }, []);

  const filteredSongs = useMemo(() => {
    let list = tab === "favs" ? songs.filter((i) => favourites.has(i.id)) : songs;
    const s = q.trim().toLowerCase();
    if (s) list = list.filter((i) => i.title.toLowerCase().includes(s));
    return list;
  }, [songs, q, tab, favourites]);

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
              onClick={() => setShowSong(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-card transition-colors hover:bg-primary/90"
            >
              <FaMusic className="h-3 w-3" /> Add Song
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

        {filtered && filtered.length === 0 && filteredSongs.length === 0 && (
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

        {filtered && (filtered.length > 0 || filteredSongs.length > 0) && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSongs.map((s) => (
              <SongCard key={s.id} item={s} favourite={isFavourite(s.id)} onToggleFav={() => toggle(s.id, s.title)} />
            ))}
            {filtered.map((t) => (
              <BriefCard key={t.id} item={t} favourite={isFavourite(t.id)} onToggleFav={() => toggle(t.id, t.title)} />
            ))}
          </div>
        )}
      </section>
      {showRequest && <RequestModal onClose={() => setShowRequest(false)} />}
      {showIssue && <IssueModal onClose={() => setShowIssue(false)} />}
      {showSong && (
        <SongModal
          onClose={() => setShowSong(false)}
          onAdded={(song) => setSongs((prev) => [song, ...prev.filter((p) => p.id !== song.id)])}
        />
      )}
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

function BriefCard({ item, favourite, onToggleFav }: { item: TrainingAudio; favourite: boolean; onToggleFav: () => void }) {
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
        onClick={onToggleFav}
        aria-label={favourite ? "Remove from favourites" : "Add to favourites"}
        aria-pressed={favourite}
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${
          favourite ? "text-destructive" : "text-muted-foreground hover:text-destructive"
        }`}
      >
        {favourite ? <FaHeart className="h-3.5 w-3.5" /> : <FaRegHeart className="h-3.5 w-3.5" />}
      </button>
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

function SongModal({ onClose, onAdded }: { onClose: () => void; onAdded: (s: TrainingSong) => void }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const MAX = 60;

  const submit = async () => {
    if (busy) return;
    if (!parseYouTubeId(url)) { setErr("Please enter a valid YouTube video URL."); return; }
    if (!title.trim()) { setErr("Please enter a song title."); return; }
    setBusy(true); setErr(null);
    try {
      const song = await addSong(url, title);
      onAdded(song);
      setDone(true);
      setTimeout(onClose, 1200);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-navy">Add song</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary" aria-label="Close">
            <FaTimes className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Share a YouTube video with everyone in the Training Center.</p>
        {done ? (
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-success/10 p-4 text-sm font-semibold text-success">
            <FaCheckCircle /> Song added.
          </div>
        ) : (
          <>
            <label className="mt-5 block text-sm">
              <span className="mb-1 block font-medium text-navy">YouTube URL</span>
              <input autoFocus type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..." className={inputCls} />
            </label>
            <label className="mt-3 block text-sm">
              <span className="mb-1 flex items-center justify-between font-medium text-navy">
                <span>Song Title</span>
                <span className="text-xs font-normal text-muted-foreground">{title.length} / {MAX}</span>
              </span>
              <input maxLength={MAX} value={title} onChange={(e) => setTitle(e.target.value.slice(0, MAX))}
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="e.g. Road safety talk" className={inputCls} />
            </label>
            {err && <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">{err}</div>}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-navy hover:bg-secondary">Cancel</button>
              <button disabled={busy || !url.trim() || !title.trim()} onClick={submit} className="rounded-lg bg-primary-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card disabled:opacity-60">
                {busy ? "Adding…" : "Add"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SongCard({ item, favourite, onToggleFav }: { item: TrainingSong; favourite: boolean; onToggleFav: () => void }) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const stop = () => setPlaying(false);
    const onSong = (e: Event) => { if ((e as CustomEvent).detail !== item.id) setPlaying(false); };
    window.addEventListener(AUDIO_PLAY_EVENT, stop);
    window.addEventListener(SONG_PLAY_EVENT, onSong);
    return () => {
      window.removeEventListener(AUDIO_PLAY_EVENT, stop);
      window.removeEventListener(SONG_PLAY_EVENT, onSong);
    };
  }, [item.id]);

  const togglePlay = () => {
    if (playing) { setPlaying(false); return; }
    pauseAllAudio();
    window.dispatchEvent(new CustomEvent(SONG_PLAY_EVENT, { detail: item.id }));
    setPlaying(true);
  };

  return (
    <article className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-card transition-colors hover:border-primary/40">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-navy/5 text-navy">
          <FaMusic className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Song</span>
          <div className="truncate text-sm font-semibold text-navy" title={item.title}>{item.title}</div>
        </div>
        <button type="button" onClick={onToggleFav} aria-label={favourite ? "Remove from favourites" : "Add to favourites"} aria-pressed={favourite}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${favourite ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}>
          {favourite ? <FaHeart className="h-3.5 w-3.5" /> : <FaRegHeart className="h-3.5 w-3.5" />}
        </button>
        <button type="button" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${playing ? "bg-navy text-navy-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
          {playing ? <FaPause className="h-3 w-3" /> : <FaPlay className="ml-0.5 h-3 w-3" />}
        </button>
      </div>
      {playing && (
        <div aria-hidden="true" className="pointer-events-none fixed -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0">
          <iframe
            width="200"
            height="200"
            tabIndex={-1}
            src={`https://www.youtube-nocookie.com/embed/${item.videoId}?autoplay=1&playsinline=1&rel=0`}
            title={item.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </article>
  );
}
