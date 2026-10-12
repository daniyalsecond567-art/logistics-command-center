import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import {
  FaTruck,
  FaRoute,
  FaMapMarkedAlt,
  FaChartLine,
  FaShieldAlt,
  FaClock,
  FaBoxes,
  FaGasPump,
} from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi";
import cascadiaImg from "@/assets/truck-cascadia.jpg";
import peterbiltImg from "@/assets/truck-peterbilt.jpg";
import kenworthImg from "@/assets/truck-kenworth.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trucking-1 | Enterprise Freight Dispatch & Fleet Portal" },
      {
        name: "description",
        content:
          "Real-time dispatch, load board management and driver training for enterprise trucking fleets. 2,400+ trucks, 48 states, 24/7 operations.",
      },
    ],
  }),
  component: HomePage,
});

const stats = [
  { label: "Active Trucks", value: "2,417", icon: FaTruck, change: "+124 wk" },
  { label: "Loads Today", value: "1,038", icon: FaBoxes, change: "+8.2%" },
  { label: "Miles Driven", value: "412,506", icon: FaRoute, change: "24h" },
  { label: "On-Time Rate", value: "98.4%", icon: FaClock, change: "+0.6%" },
];

const dispatchBoard = [
  { id: "LD-88214", origin: "Dallas, TX", dest: "Atlanta, GA", driver: "R. Alvarez", status: "En route", eta: "4h 12m", weight: "42,180 lbs" },
  { id: "LD-88215", origin: "Chicago, IL", dest: "Denver, CO", driver: "M. Chen", status: "Loading", eta: "—", weight: "38,920 lbs" },
  { id: "LD-88216", origin: "Los Angeles, CA", dest: "Phoenix, AZ", driver: "J. Patel", status: "Delivered", eta: "Complete", weight: "27,540 lbs" },
  { id: "LD-88217", origin: "Newark, NJ", dest: "Miami, FL", driver: "T. Brooks", status: "En route", eta: "9h 48m", weight: "44,020 lbs" },
  { id: "LD-88218", origin: "Seattle, WA", dest: "Salt Lake City, UT", driver: "K. Nowak", status: "Delayed", eta: "+2h", weight: "39,760 lbs" },
];

const fleetCards = [
  { name: "Freightliner Cascadia", type: "Sleeper Tractor", count: 842, image: cascadiaImg },
  { name: "Peterbilt 579", type: "Long-haul Tractor", count: 614, image: peterbiltImg },
  { name: "Kenworth T680", type: "Regional Hauler", count: 512, image: kenworthImg },
];

const activity = [
  { time: "14:32", text: "Load LD-88214 departed Dallas terminal", tag: "Dispatch" },
  { time: "14:19", text: "PM inspection completed on Unit #4820", tag: "Fleet" },
  { time: "14:04", text: "Driver R. Alvarez logged HOS reset — 34h", tag: "Compliance" },
  { time: "13:47", text: "Fuel purchase — 184 gal @ Love's #372", tag: "Fuel" },
  { time: "13:22", text: "New driver A. Okoro completed orientation", tag: "Training" },
];

function statusStyle(s: string) {
  if (s === "En route") return "bg-primary/10 text-primary";
  if (s === "Loading") return "bg-warning/15 text-warning";
  if (s === "Delivered") return "bg-success/15 text-success";
  return "bg-destructive/15 text-destructive";
}

function HomePage() {
  const reducedMotion = useReducedMotion();
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-gradient text-navy-foreground">
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1616432043562-3671ea2e5242?auto=format&fit=crop&w=2400&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-transparent" />

        <div className="container-max relative z-10 grid gap-12 py-20 lg:grid-cols-[1.2fr_1fr] lg:py-32">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.7 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              48-state coverage · 24/7 dispatch
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl xl:text-7xl">
              Moving America's freight, <span className="text-primary-glow">one mile at a time.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-navy-foreground/80 sm:text-lg">
              Trucking-1 runs the dispatch board, fleet operations and driver training for over
              2,400 power units across the continental US — built for the offices that never sleep.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dispatch"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                Open Dispatch Board <HiArrowRight />
              </Link>
              <Link
                to="/training"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-navy-foreground transition-colors hover:bg-white/10"
              >
                Driver Training Center
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                ["18+", "Years running"],
                ["2.4K", "Trucks in fleet"],
                ["48", "States covered"],
                ["98.4%", "On-time rate"],
              ].map(([v, l]) => (
                <div key={l}>
                  <div className="font-display text-2xl font-bold sm:text-3xl">{v}</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-navy-foreground/60">{l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.2 }}
            className="hidden lg:block"
          >
            <div className="rounded-2xl border border-white/15 bg-navy/70 p-6 backdrop-blur-xl shadow-elevated ring-1 ring-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-navy-foreground/70">Live Ops Feed</div>
                  <div className="mt-1 font-display text-xl font-bold text-white">Central Dispatch — DFW</div>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-success/25 text-success ring-1 ring-success/40">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                </span>
              </div>
              <div className="mt-6 space-y-3">
                {dispatchBoard.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm ring-1 ring-white/10"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-white">{r.id}</div>
                      <div className="text-xs text-navy-foreground/75 truncate">
                        {r.origin} → {r.dest}
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="container-max -mt-10 relative z-20">
        <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-elevated sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-4 rounded-xl bg-secondary/60 p-4 transition-colors hover:bg-secondary"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-gradient text-primary-foreground">
                <s.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{s.label}</div>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="font-display text-2xl font-bold text-navy">{s.value}</span>
                  <span className="text-xs font-semibold text-success">{s.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FLEET CARDS */}
      <section className="container-max py-20">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Fleet</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-navy sm:text-4xl">
              A modern power fleet, tuned for the long haul.
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Class 8 tractors, car-carrier trailers and refrigerated units — all governed by our
              central telematics platform.
            </p>
          </div>
          <Link
            to="/fleet"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-secondary"
          >
            Browse full fleet <HiArrowRight />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {fleetCards.map((f, i) => (
            <motion.div
              key={f.name}
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : i * 0.1 }}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                <img
                  src={f.image}
                  alt={f.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => { const t = e.currentTarget; const fb = "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80"; if (t.src !== fb) t.src = fb; }}
                />
                <span className="absolute right-3 top-3 rounded-full bg-navy/85 px-2.5 py-1 text-xs font-semibold text-navy-foreground">
                  {f.count} units
                </span>
              </div>
              <div className="p-5">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{f.type}</div>
                <h3 className="mt-1 font-display text-lg font-bold text-navy">{f.name}</h3>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><FaGasPump className="h-3 w-3" /> 7.2 mpg</span>
                  <span className="inline-flex items-center gap-1.5"><FaShieldAlt className="h-3 w-3" /> ADAS</span>
                  <span className="inline-flex items-center gap-1.5"><FaChartLine className="h-3 w-3" /> ELD</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DISPATCH BOARD + ACTIVITY */}
      <section className="container-max grid gap-6 pb-20 lg:grid-cols-[2fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-panel-gradient px-6 py-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live board</div>
              <h3 className="mt-1 font-display text-lg font-bold text-navy">Dispatch — active loads</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-success/15 text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              </span>
              Auto-refreshing every 15s
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 text-left">Load</th>
                  <th className="px-6 py-3 text-left">Route</th>
                  <th className="px-6 py-3 text-left">Driver</th>
                  <th className="px-6 py-3 text-left">Weight</th>
                  <th className="px-6 py-3 text-left">ETA</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dispatchBoard.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-6 py-3 font-semibold text-navy">{r.id}</td>
                    <td className="px-6 py-3 text-muted-foreground">{r.origin} → {r.dest}</td>
                    <td className="px-6 py-3">{r.driver}</td>
                    <td className="px-6 py-3 text-muted-foreground">{r.weight}</td>
                    <td className="px-6 py-3 font-medium">{r.eta}</td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recent Activity</div>
          <h3 className="mt-1 font-display text-lg font-bold text-navy">Ops event feed</h3>
          <ul className="mt-6 space-y-4">
            {activity.map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary">{a.tag}</span>
                    <span className="text-xs text-muted-foreground">{a.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{a.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MAP + REPORT PREVIEW */}
      <section className="container-max grid gap-6 pb-24 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="border-b border-border px-6 py-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Coverage</div>
            <h3 className="mt-1 font-display text-lg font-bold text-navy">Continental route map</h3>
          </div>
          <div className="relative aspect-[16/10] bg-navy">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80"
              alt="Route map"
              className="h-full w-full object-cover opacity-50"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2 text-navy-foreground">
              {[
                ["West", "742"],
                ["Central", "1,104"],
                ["East", "571"],
              ].map(([r, n]) => (
                <div key={r} className="rounded-lg bg-navy/60 px-3 py-2 backdrop-blur-md">
                  <div className="text-xs uppercase tracking-widest text-navy-foreground/70">{r}</div>
                  <div className="mt-0.5 font-display text-lg font-bold">{n}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Weekly report</div>
          <h3 className="mt-1 font-display text-lg font-bold text-navy">Fleet performance — week 47</h3>
          <div className="mt-6 grid grid-cols-7 items-end gap-2 h-40">
            {[62, 74, 55, 88, 71, 92, 80].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-md bg-primary-gradient transition-all hover:opacity-80"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] font-medium uppercase text-muted-foreground">
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              ["Utilization", "87%"],
              ["Deadhead", "9.2%"],
              ["Idle time", "4.1h"],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-secondary/70 p-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{l}</div>
                <div className="mt-1 font-display text-lg font-bold text-navy">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-max pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-hero-gradient p-10 text-navy-foreground shadow-elevated sm:p-16">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary-glow/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
                <FaMapMarkedAlt /> Ready to roll
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
                Bring your dispatch office into the modern fleet era.
              </h2>
              <p className="mt-4 max-w-xl text-navy-foreground/80">
                Live boards, driver training, telematics and safety compliance — all under one enterprise portal.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-navy transition-transform hover:scale-[1.02]"
              >
                Talk to Sales
              </Link>
              <Link
                to="/training"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-navy-foreground transition-colors hover:bg-white/10"
              >
                Driver Training
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
