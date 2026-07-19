import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaPlay, FaPause, FaHeadphonesAlt, FaSearch, FaClipboardList, FaPlus, FaTimes, FaCheckCircle } from "react-icons/fa";
import { PageHeader } from "@/components/layout/PageHeader";
import { listTraining, type TrainingAudio } from "@/services/trainingService";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { createRequest } from "@/services/requestService";


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
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    listTraining()
      .then((rows) => alive && setItems(rows))
      .catch((e) => alive && setError((e as Error).message));
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!items) return null;
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) => i.title.toLowerCase().includes(s) || i.description.toLowerCase().includes(s));
  }, [items, q]);

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
          <div className="relative w-full max-w-xs">
            <FaSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search briefs..."
              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
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
            <FaHeadphonesAlt className="mx-auto h-8 w-8 text-primary" />
            <h3 className="mt-3 font-display text-base font-bold text-navy">No briefs yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Admins can upload briefs from the <a href="/admin" className="font-semibold text-primary">Admin Portal</a>.
            </p>
          </div>
        )}

        {filtered && filtered.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((t) => (
              <BriefCard key={t.id} item={t} />
            ))}
          </div>
        )}
      </section>
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
