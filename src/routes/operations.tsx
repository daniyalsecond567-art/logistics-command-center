import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { FaTools, FaShieldAlt, FaClipboardCheck, FaExclamationTriangle } from "react-icons/fa";

export const Route = createFileRoute("/operations")({
  head: () => ({
    meta: [
      { title: "Operations Hub | Trucking-1" },
      { name: "description", content: "Maintenance schedules, safety compliance, HOS oversight and yard operations." },
    ],
  }),
  component: OperationsPage,
});

const tiles = [
  { title: "Preventive Maintenance", desc: "24 units scheduled this week for PM-A service.", icon: FaTools, count: "24" },
  { title: "DOT Compliance", desc: "All CDL & med-cards current. 3 expirations in 30 days.", icon: FaShieldAlt, count: "100%" },
  { title: "Pre-Trip Inspections", desc: "412 driver inspections logged in the last 24h.", icon: FaClipboardCheck, count: "412" },
  { title: "Active Alerts", desc: "2 tractors flagged for engine derate. Dispatchers notified.", icon: FaExclamationTriangle, count: "2" },
];

const maintenance = [
  { unit: "#4820", type: "PM-A · 25k service", due: "Nov 21", terminal: "Dallas", status: "Scheduled" },
  { unit: "#3915", type: "Brake inspection", due: "Nov 22", terminal: "Chicago", status: "Scheduled" },
  { unit: "#5182", type: "DPF regen check", due: "Nov 19", terminal: "Los Angeles", status: "Overdue" },
  { unit: "#4491", type: "Tire rotation", due: "Nov 24", terminal: "Newark", status: "Scheduled" },
  { unit: "#5340", type: "Alignment", due: "Nov 25", terminal: "Seattle", status: "Scheduled" },
];

function OperationsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Keeping 2,400+ trucks compliant, maintained and moving."
      />
      <section className="container-max grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.title} className="rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-gradient text-primary-foreground"><t.icon className="h-5 w-5" /></span>
              <span className="font-display text-2xl font-bold text-navy">{t.count}</span>
            </div>
            <h3 className="mt-4 font-display text-base font-bold text-navy">{t.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
          </div>
        ))}
      </section>

      <section className="container-max grid gap-6 pb-20 lg:grid-cols-[2fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="border-b border-border bg-panel-gradient px-6 py-4">
            <h2 className="font-display text-lg font-bold text-navy">Maintenance queue</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 text-left">Unit</th>
                  <th className="px-6 py-3 text-left">Service</th>
                  <th className="px-6 py-3 text-left">Due</th>
                  <th className="px-6 py-3 text-left">Terminal</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {maintenance.map((m) => (
                  <tr key={m.unit + m.type} className="hover:bg-secondary/40">
                    <td className="px-6 py-3 font-semibold text-navy">{m.unit}</td>
                    <td className="px-6 py-3">{m.type}</td>
                    <td className="px-6 py-3">{m.due}</td>
                    <td className="px-6 py-3 text-muted-foreground">{m.terminal}</td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${m.status === "Overdue" ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"}`}>{m.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-bold text-navy">Safety scorecard</h3>
          <p className="mt-1 text-sm text-muted-foreground">Rolling 30-day snapshot.</p>
          <div className="mt-6 space-y-5">
            {[
              ["Safe driving score", 94],
              ["HOS compliance", 99],
              ["Pre-trip completion", 97],
              ["Speeding events", 88],
            ].map(([l, v]) => (
              <div key={l as string}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/80">{l}</span>
                  <span className="font-semibold text-navy">{v}%</span>
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
