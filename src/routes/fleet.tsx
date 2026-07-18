import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { FaTruck, FaTruckMoving, FaTrailer, FaSnowflake, FaCarSide, FaOilCan } from "react-icons/fa";

export const Route = createFileRoute("/fleet")({
  head: () => ({
    meta: [
      { title: "Fleet Management | Trucking-1" },
      { name: "description", content: "2,417 power units, 3,102 trailers and 812 car-carriers under central telematics." },
    ],
  }),
  component: FleetPage,
});

const FALLBACK_IMG = "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80";

const fleet = [
  { name: "Freightliner Cascadia", type: "Sleeper Tractor", count: 842, mpg: "7.4", year: "2022-2025", img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80", icon: FaTruckMoving },
  { name: "Peterbilt 579", type: "Long-haul Tractor", count: 614, mpg: "7.1", year: "2021-2024", img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80", icon: FaTruck },
  { name: "Kenworth T680", type: "Regional Hauler", count: 512, mpg: "7.2", year: "2022-2025", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80", icon: FaTruck },
  { name: "Volvo VNL 860", type: "Sleeper Tractor", count: 289, mpg: "7.6", year: "2023-2025", img: "https://images.unsplash.com/photo-1586191582056-b7f0d5c0e2c1?auto=format&fit=crop&w=1200&q=80", icon: FaTruckMoving },
  { name: "Reefer Trailers 53'", type: "Refrigerated", count: 402, mpg: "—", year: "Mixed", img: "https://images.unsplash.com/photo-1601158935942-52255782d322?auto=format&fit=crop&w=1200&q=80", icon: FaSnowflake },
  { name: "Car-Carrier 9-Unit", type: "Vehicle Transport", count: 158, mpg: "6.4", year: "2022-2024", img: "https://images.unsplash.com/photo-1554260570-9140fd3b7614?auto=format&fit=crop&w=1200&q=80", icon: FaCarSide },
];

function FleetPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Fleet"
        title="One fleet. One telematics platform. Continental coverage."
        description="Every unit is tracked in real time — engine health, HOS, fuel, temperature and location — on the same operations console your dispatch team already uses."
      />

      <section className="container-max grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Power units", v: "2,417", i: FaTruck },
          { l: "Trailers", v: "3,102", i: FaTrailer },
          { l: "Reefer units", v: "402", i: FaSnowflake },
          { l: "Avg MPG", v: "7.3", i: FaOilCan },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-gradient text-primary-foreground">
                <s.i className="h-5 w-5" />
              </span>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.l}</div>
                <div className="font-display text-2xl font-bold text-navy">{s.v}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="container-max grid gap-6 pb-24 md:grid-cols-2 lg:grid-cols-3">
        {fleet.map((f) => (
          <article key={f.name} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img src={f.img} alt={f.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy/80 to-transparent" />
              <span className="absolute right-3 top-3 rounded-full bg-navy/85 px-3 py-1 text-xs font-bold text-navy-foreground">
                {f.count} units
              </span>
              <span className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-primary-gradient px-3 py-1 text-xs font-semibold text-primary-foreground">
                <f.icon className="h-3 w-3" /> {f.type}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-display text-lg font-bold text-navy">{f.name}</h3>
              <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                <div><div className="text-muted-foreground uppercase">Model yr</div><div className="mt-1 font-semibold text-navy">{f.year}</div></div>
                <div><div className="text-muted-foreground uppercase">Avg MPG</div><div className="mt-1 font-semibold text-navy">{f.mpg}</div></div>
                <div><div className="text-muted-foreground uppercase">Status</div><div className="mt-1 font-semibold text-success">Active</div></div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
