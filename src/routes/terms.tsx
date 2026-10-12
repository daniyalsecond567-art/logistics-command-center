import { createFileRoute } from "@tanstack/react-router";
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
  return (
    <div>
      <PageHeader
        eyebrow="Legal"
        title="Terms & Conditions."
        description="Please read these terms carefully before using this website."
      />
      <section className="container-max py-10">
        <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed text-foreground shadow-card sm:p-10">
          <div>
            <h2 className="font-display text-lg font-bold text-navy">1. Demonstration Notice</h2>
            <p className="mt-2 text-muted-foreground">
              This website ("Trucking-1") is a personal demonstration project created solely for
              learning, user-interface demonstration, and entertainment purposes. It is
              <strong className="text-navy"> not </strong>
              an official trucking, logistics, freight, dispatch, transportation, or fleet
              management platform, and it is not affiliated with any real carrier or operator.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-navy">2. No Real Services</h2>
            <p className="mt-2 text-muted-foreground">
              No real dispatching, freight booking, carrier operations, driver management, or
              transportation services are provided through this website. All actions performed
              inside the application are simulated for demonstration purposes only.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-navy">3. Fictional Content</h2>
            <p className="mt-2 text-muted-foreground">
              Any names, truck information, driver briefs, fleet statistics, training materials,
              load boards, reports, or other content displayed on this website are fictional,
              generated, or used strictly for demonstration purposes. Any resemblance to real
              persons, companies, or operations is coincidental.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-navy">4. No Reliance</h2>
            <p className="mt-2 text-muted-foreground">
              The website must not be relied upon for any real business operation, regulatory
              filing, dispatch decision, safety-critical activity, or commercial transaction.
              The content is provided "as is" without warranties of any kind.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-navy">5. Limitation of Liability</h2>
            <p className="mt-2 text-muted-foreground">
              The creators of this website accept no responsibility or liability for any
              misuse, loss, damage, or consequence arising from the use, misuse, or inability
              to use this demonstration website.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-navy">6. Acknowledgement</h2>
            <p className="mt-2 text-muted-foreground">
              By accessing or using this website, you acknowledge and agree that it is a
              demonstration application created for educational, illustrative, and
              entertainment purposes only, and you accept these terms in full.
            </p>
          </div>

          <p className="pt-4 text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </article>
      </section>
    </div>
  );
}
