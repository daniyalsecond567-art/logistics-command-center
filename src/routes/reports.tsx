import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Reports & Analytics | Trucking-1" },
      { property: "og:description", content: "Revenue per mile, utilization, fuel and safety analytics across the fleet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Reports & Analytics | Trucking-1" },
      { name: "description", content: "Revenue per mile, utilization, fuel and safety analytics across the fleet." },
    ],
  }),
  component: ReportsPage,
});

const kpis = [
  { l: "Revenue / mile", v: "$2.84", d: "+$0.12", pos: true },
  { l: "Utilization", v: "87.2%", d: "+1.4%", pos: true },
  { l: "Fuel cost / mi", v: "$0.61", d: "-$0.03", pos: true },
  { l: "Deadhead %", v: "9.2%", d: "-0.8%", pos: true },
  { l: "Accidents / MM mi", v: "0.42", d: "-0.06", pos: true },
  { l: "Avg length haul", v: "748 mi", d: "+22 mi", pos: true },
];

function ReportsPage() {
  return (
    <div>
      <PageHeader eyebrow="Reports" title="Fleet analytics & operational KPIs." description="Weekly, monthly and quarterly performance reporting across every business unit." />

      <section className="container-max grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.l} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{k.l}</div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-navy">{k.v}</span>
              <span className={`text-sm font-semibold ${k.pos ? "text-success" : "text-destructive"}`}>{k.d}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="container-max grid gap-6 pb-20 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-bold text-navy">Revenue — last 12 weeks ($M)</h3>
          <div className="mt-6 grid h-56 grid-cols-12 items-end gap-2">
            {[42, 48, 44, 52, 58, 55, 62, 68, 64, 71, 75, 82].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-full rounded-md bg-primary-gradient transition-opacity hover:opacity-80" style={{ height: `${h}%` }} />
                <span className="text-[10px] text-muted-foreground">W{i + 36}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-bold text-navy">Utilization by region</h3>
          <div className="mt-6 space-y-5">
            {[
              ["West", 84],
              ["Central", 91],
              ["Northeast", 87],
              ["Southeast", 89],
              ["Mountain", 78],
            ].map(([r, v]) => (
              <div key={r as string}>
                <div className="flex items-center justify-between text-sm">
                  <span>{r}</span><span className="font-semibold text-navy">{v}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary-gradient" style={{ width: `${v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
