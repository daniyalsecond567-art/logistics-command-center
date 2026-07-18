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
      <div className="container-max relative z-10 py-16 sm:py-20">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-glow">
          {eyebrow}
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-navy-foreground/75">{description}</p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
