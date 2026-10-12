import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/loads")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Load Board | Trucking-1" },
      { property: "og:description", content: "Open freight loads across 48 states. Filter by weight, equipment and lane." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Load Board | Trucking-1" },
      { name: "description", content: "Open freight loads across 48 states. Filter by weight, equipment and lane." },
    ],
  }),
  component: LoadsPage,
});

const loads = [
  { id: "L-90441", commodity: "Auto Parts", origin: "Detroit, MI", dest: "Louisville, KY", weight: "38,400 lbs", rate: "$2,140", equip: "53' Van", posted: "12 min ago" },
  { id: "L-90442", commodity: "Frozen Foods", origin: "Fresno, CA", dest: "Salt Lake City, UT", weight: "41,200 lbs", rate: "$3,680", equip: "Reefer", posted: "18 min ago" },
  { id: "L-90443", commodity: "Steel Coils", origin: "Gary, IN", dest: "Houston, TX", weight: "44,800 lbs", rate: "$4,020", equip: "Flatbed", posted: "24 min ago" },
  { id: "L-90444", commodity: "Retail Goods", origin: "Memphis, TN", dest: "Charlotte, NC", weight: "22,100 lbs", rate: "$1,480", equip: "53' Van", posted: "31 min ago" },
  { id: "L-90445", commodity: "Vehicles (6)", origin: "Long Beach, CA", dest: "Denver, CO", weight: "24,500 lbs", rate: "$3,920", equip: "Car-Carrier", posted: "38 min ago" },
  { id: "L-90446", commodity: "Building Mat.", origin: "Boise, ID", dest: "Portland, OR", weight: "39,600 lbs", rate: "$1,720", equip: "Flatbed", posted: "44 min ago" },
  { id: "L-90447", commodity: "Grocery", origin: "Orlando, FL", dest: "Atlanta, GA", weight: "35,200 lbs", rate: "$1,320", equip: "Reefer", posted: "52 min ago" },
  { id: "L-90448", commodity: "Machinery", origin: "Milwaukee, WI", dest: "Omaha, NE", weight: "42,800 lbs", rate: "$2,240", equip: "Flatbed", posted: "1 hr ago" },
];

function LoadsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Loads"
        title="Live freight load board."
        description="Real-time posted freight from our shipper network. Auto-refreshed every minute."
      />
      <section className="container-max pb-20 pt-10">
        <div className="mb-6 flex flex-wrap gap-2">
          {["All", "53' Van", "Reefer", "Flatbed", "Car-Carrier", "Tanker"].map((t, i) => (
            <button
              key={t}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                i === 0 ? "border-transparent bg-primary-gradient text-primary-foreground shadow-card" : "border-border bg-card text-navy hover:bg-secondary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 text-left">Load ID</th>
                  <th className="px-6 py-3 text-left">Commodity</th>
                  <th className="px-6 py-3 text-left">Origin → Destination</th>
                  <th className="px-6 py-3 text-left">Weight</th>
                  <th className="px-6 py-3 text-left">Equipment</th>
                  <th className="px-6 py-3 text-right">Rate</th>
                  <th className="px-6 py-3 text-right">Posted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loads.map((l) => (
                  <tr key={l.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-6 py-4 font-semibold text-navy">{l.id}</td>
                    <td className="px-6 py-4">{l.commodity}</td>
                    <td className="px-6 py-4 text-muted-foreground">{l.origin} → {l.dest}</td>
                    <td className="px-6 py-4">{l.weight}</td>
                    <td className="px-6 py-4"><span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-navy">{l.equip}</span></td>
                    <td className="px-6 py-4 text-right font-display text-base font-bold text-success">{l.rate}</td>
                    <td className="px-6 py-4 text-right text-xs text-muted-foreground">{l.posted}</td>
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
