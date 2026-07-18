import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Trucking-1 | 18 Years Moving Freight" },
      { name: "description", content: "Family-owned since 2007. 2,400+ trucks, 5,800+ drivers, 48-state operations." },
    ],
  }),
  component: AboutPage,
});

const timeline = [
  { y: "2007", t: "Founded in Dallas, TX with 12 tractors and a single dispatch desk." },
  { y: "2012", t: "Crossed 500 units and opened regional hubs in Chicago and Atlanta." },
  { y: "2017", t: "Deployed proprietary ELD + telematics stack fleet-wide." },
  { y: "2021", t: "Acquired PacWest Carriers; expanded car-carrier division." },
  { y: "2024", t: "Reached 2,400 power units, 18 regional hubs, 48-state coverage." },
];

function AboutPage() {
  return (
    <div>
      <PageHeader eyebrow="About" title="Family-run freight, enterprise-grade operations." description="From a 12-truck yard in Dallas to 2,400+ units across the continent — our operations team never stops running the board." />
      <section className="container-max grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Our story</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-navy">Built by dispatchers, for dispatchers.</h2>
          <p className="mt-4 text-muted-foreground">Trucking-1 was started by a second-generation trucking family who spent decades running a board with paper, radios and a wall of pinned load slips. The tools kept letting them down — so they built their own.</p>
          <p className="mt-3 text-muted-foreground">Today the same operating platform powers our full fleet: dispatch, driver training, HOS oversight, maintenance and safety compliance — all in one console.</p>
        </div>
        <div className="overflow-hidden rounded-2xl shadow-elevated">
          <img src="https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1200&q=80" alt="Trucking-1 fleet" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="container-max pb-20">
        <h2 className="font-display text-3xl font-bold text-navy">Milestones</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {timeline.map((t) => (
            <div key={t.y} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="font-display text-2xl font-bold text-primary">{t.y}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t.t}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
