import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaPlay, FaPause, FaHeadphonesAlt, FaSearch } from "react-icons/fa";
import { PageHeader } from "@/components/layout/PageHeader";
import { listTraining, type TrainingAudio } from "@/services/trainingService";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { formatDuration } from "@/utils/format";

export const Route = createFileRoute("/training")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Driver Training Center | Trucking-1" },
      { name: "description", content: "Driver safety, orientation and operations training briefs. Audio-based training resources for on-the-road learning." },
    ],
  }),
  component: TrainingPage,
});

function TrainingPage() {
  const [items, setItems] = useState<TrainingAudio[] | null>(null);
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
        description="Audio training briefs covering safety, orientation, dispatch communication and emergency procedures. Only one recording plays at a time."
      />
      <section className="container-max py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FaHeadphonesAlt /> Use company-issued headphones for on-yard listening.
          </div>
          <div className="relative w-full max-w-xs">
            <FaSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search briefs..."
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load training resources: {error}
          </div>
        )}

        {!filtered && !error && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl border border-border bg-card" />
            ))}
          </div>
        )}

        {filtered && filtered.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-card">
            <FaHeadphonesAlt className="mx-auto h-10 w-10 text-primary" />
            <h3 className="mt-4 font-display text-lg font-bold text-navy">No training briefs yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Admins can upload MP3 briefs from the <a href="/admin" className="font-semibold text-primary">Admin Portal</a>.
            </p>
          </div>
        )}

        {filtered && filtered.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t, i) => (
              <TrainingCard key={t.id} item={t} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TrainingCard({ item, index }: { item: TrainingAudio; index: number }) {
  const { playing, currentTime, duration, toggle } = useAudioPlayer(item.audioUrl);
  const dur = duration || item.duration || 0;
  const pct = dur ? (currentTime / dur) * 100 : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated"
    >
      <div className="relative bg-hero-gradient p-6 text-navy-foreground">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">
            <FaHeadphonesAlt className="h-2.5 w-2.5" /> Audio brief
          </span>
          <span className="font-display text-xs font-semibold">{formatDuration(dur)}</span>
        </div>
        <h3 className="mt-6 font-display text-lg font-bold leading-tight">{item.title}</h3>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="min-h-[3rem] text-sm text-muted-foreground">{item.description || "Company training resource."}</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary-gradient transition-[width] duration-200" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(dur)}</span>
        </div>
        <button
          type="button"
          onClick={toggle}
          className={`mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            playing
              ? "bg-navy text-navy-foreground hover:bg-navy/90"
              : "bg-primary-gradient text-primary-foreground shadow-card hover:scale-[1.02]"
          }`}
        >
          {playing ? <><FaPause className="h-3 w-3" /> Pause</> : <><FaPlay className="h-3 w-3" /> Start</>}
        </button>
      </div>
    </motion.article>
  );
}
