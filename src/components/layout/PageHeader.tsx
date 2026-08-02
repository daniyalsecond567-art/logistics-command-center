import type { ReactNode } from "react";

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: Props) {
  return (
    <section className="relative overflow-hidden bg-hero-gradient text-navy-foreground">
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />
      </div>
      <div className="fx-grid pointer-events-none absolute inset-0 opacity-30" />
      <span
        aria-hidden="true"
        className="fx-lane"
        style={{ top: "38%", animationDuration: "11s", opacity: 0.45 }}
      />
      <span
        aria-hidden="true"
        className="fx-lane"
        style={{ top: "72%", animationDuration: "15s", animationDelay: "2.5s", opacity: 0.3 }}
      />
      <div className="container-max relative z-10 py-16 sm:py-20">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-glow">
            {eyebrow}
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
        </Reveal>
        {description && (
          <Reveal delay={160}>
            <p className="mt-4 max-w-2xl text-navy-foreground/75">{description}</p>
          </Reveal>
        )}
        {children && (
          <Reveal delay={220}>
            <div className="mt-6">{children}</div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

