import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { FaBroadcastTower, FaHeadset, FaMapMarkerAlt } from "react-icons/fa";

export const Route = createFileRoute("/dispatch")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Live Dispatch Board | Trucking-1" },
      { property: "og:description", content: "24/7 dispatch board with real-time truck tracking, load assignments and ETA management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Live Dispatch Board | Trucking-1" },
      { name: "description", content: "24/7 dispatch board with real-time truck tracking, load assignments and ETA management." },
    ],
  }),
  component: DispatchPage,
});

const board = [
  { id: "LD-88214", origin: "Dallas, TX", dest: "Atlanta, GA", driver: "R. Alvarez", unit: "#4820", status: "En route", eta: "4h 12m", progress: 62 },
  { id: "LD-88215", origin: "Chicago, IL", dest: "Denver, CO", driver: "M. Chen", unit: "#3915", status: "Loading", eta: "—", progress: 5 },
  { id: "LD-88216", origin: "Los Angeles, CA", dest: "Phoenix, AZ", driver: "J. Patel", unit: "#5182", status: "Delivered", eta: "Complete", progress: 100 },
  { id: "LD-88217", origin: "Newark, NJ", dest: "Miami, FL", driver: "T. Brooks", unit: "#4491", status: "En route", eta: "9h 48m", progress: 34 },
  { id: "LD-88218", origin: "Seattle, WA", dest: "Salt Lake City, UT", driver: "K. Nowak", unit: "#5340", status: "Delayed", eta: "+2h", progress: 41 },
  { id: "LD-88219", origin: "Kansas City, MO", dest: "Nashville, TN", driver: "S. Ibrahim", unit: "#4207", status: "En route", eta: "3h 05m", progress: 78 },
  { id: "LD-88220", origin: "Portland, OR", dest: "Boise, ID", driver: "A. Okoro", unit: "#3612", status: "Assigned", eta: "Pending", progress: 0 },
];

function statusStyle(s: string) {
  if (s === "En route") return "bg-primary/10 text-primary";
  if (s === "Loading") return "bg-warning/15 text-warning";
  if (s === "Delivered") return "bg-success/15 text-success";
  if (s === "Assigned") return "bg-muted text-muted-foreground";
  return "bg-destructive/15 text-destructive";
}

function DispatchPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Dispatch"
        title="Live dispatch board — 24/7 continental ops."
        description="One board for every load, driver, tractor and HOS clock across the fleet."
      />
      <section className="container-max grid gap-4 py-10 md:grid-cols-3">
        {[
          { l: "Loads in motion", v: "512", i: FaBroadcastTower, sub: "Right now" },
          { l: "Dispatchers on-line", v: "34", i: FaHeadset, sub: "3 regional desks" },
          { l: "Regional hubs", v: "18", i: FaMapMarkerAlt, sub: "48-state coverage" },
        ].map((s) => (
          <div key={s.l} className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-card">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.l}</div>
              <div className="mt-1 font-display text-3xl font-bold text-navy">{s.v}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{s.sub}</div>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-gradient text-primary-foreground">
              <s.i className="h-5 w-5" />
            </span>
          </div>
        ))}
      </section>

      <section className="container-max pb-20">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-panel-gradient px-6 py-4">
            <h2 className="font-display text-lg font-bold text-navy">Active loads</h2>
            <div className="flex gap-2 text-xs">
              <button className="rounded-lg bg-primary-gradient px-3 py-1.5 font-semibold text-primary-foreground">All</button>
              <button className="rounded-lg border border-border px-3 py-1.5 text-navy hover:bg-secondary">En route</button>
              <button className="rounded-lg border border-border px-3 py-1.5 text-navy hover:bg-secondary">Delayed</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 text-left">Load</th>
                  <th className="px-6 py-3 text-left">Route</th>
                  <th className="px-6 py-3 text-left">Driver / Unit</th>
                  <th className="px-6 py-3 text-left">Progress</th>
                  <th className="px-6 py-3 text-left">ETA</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {board.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-6 py-4 font-semibold text-navy">{r.id}</td>
                    <td className="px-6 py-4 text-muted-foreground">{r.origin} → {r.dest}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{r.driver}</div>
                      <div className="text-xs text-muted-foreground">Unit {r.unit}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-2 w-40 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-primary-gradient" style={{ width: `${r.progress}%` }} />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{r.progress}%</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{r.eta}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(r.status)}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
