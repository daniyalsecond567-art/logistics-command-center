import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DEFAULT_TERMS, DEFAULT_TERMS_DATE, getTerms, type TermsSection } from "@/services/termsService";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Terms & Conditions | Trucking-1" },
      { property: "og:description", content: "Terms & Conditions and disclaimer for the Trucking-1 demonstration website." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Terms & Conditions | Trucking-1" },
      {
        name: "description",
        content:
          "Terms & Conditions and disclaimer for the Trucking-1 demonstration website.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const [sections, setSections] = useState<TermsSection[]>(DEFAULT_TERMS);
  const [updated, setUpdated] = useState<Date>(DEFAULT_TERMS_DATE);
  useEffect(() => {
    getTerms().then((t) => {
      if (!t) return;
      setSections(t.sections);
      if (t.updatedAt) setUpdated(t.updatedAt.toDate());
    }).catch(() => { /* keep built-in terms */ });
  }, []);
  return (
    <div>
      <PageHeader
        eyebrow="Legal"
        title="Terms & Conditions."
        description="Please read these terms carefully before using this website."
      />
      <section className="container-max py-10">
        <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed text-foreground shadow-card sm:p-10">
          {sections.map((sec, i) => (
            <div key={i}>
              <h2 className="font-display text-lg font-bold text-navy">{i + 1}. {sec.title}</h2>
              <p className="mt-2 whitespace-pre-line text-muted-foreground">{sec.body}</p>
            </div>
          ))}
          <p className="pt-4 text-xs text-muted-foreground">
            Last updated: {updated.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </article>
      </section>
    </div>
  );
}
