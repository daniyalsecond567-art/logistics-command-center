import { Link } from "@tanstack/react-router";
import { FaTruckMoving, FaFacebookF, FaLinkedinIn, FaTwitter, FaYoutube } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="mt-24 bg-navy text-navy-foreground">
      <div className="container-max grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-gradient shadow-glow">
              <FaTruckMoving className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">TRUCKING-1</span>
          </div>
          <p className="mt-4 text-sm text-navy-foreground/70 leading-relaxed">
            Enterprise-grade freight, dispatch and fleet operations for the modern trucking industry.
          </p>
          <div className="mt-6 flex gap-2">
            {[FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-navy-foreground/80 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-navy-foreground/60">Operations</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              { to: "/dispatch", label: "Live Dispatch" },
              { to: "/loads", label: "Load Board" },
              { to: "/fleet", label: "Fleet Management" },
              { to: "/operations", label: "Operations Hub" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-navy-foreground/80 transition-colors hover:text-primary-glow">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-navy-foreground/60">Company</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              { to: "/about", label: "About Us" },
              { to: "/training", label: "Driver Training" },
              { to: "/reports", label: "Reports" },
              { to: "/contact", label: "Contact" },
              { to: "/terms", label: "Terms & Conditions" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-navy-foreground/80 transition-colors hover:text-primary-glow">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-navy-foreground/60">Dispatch HQ</h4>
          <ul className="mt-4 space-y-3 text-sm text-navy-foreground/80">
            <li>4820 Freight Corridor Blvd</li>
            <li>Dallas, TX 75201</li>
            <li>Ops line: 1-800-TRUCK-01</li>
            <li>dispatch@trucking-1.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-max flex flex-col items-start justify-between gap-3 py-6 text-xs text-navy-foreground/60 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Trucking-1 Freight Systems. MC-984213 · DOT-2841057.</span>
          <span>Built for enterprise dispatch offices.</span>
        </div>
      </div>
    </footer>
  );
}
