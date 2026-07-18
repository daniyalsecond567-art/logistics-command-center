import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaHeadset } from "react-icons/fa";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Trucking-1 Dispatch" },
      { name: "description", content: "Call our dispatch line 24/7 or send a message to our operations team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div>
      <PageHeader eyebrow="Contact" title="Talk to a real dispatcher, any hour." description="Our ops line runs 24/7. For quotes, shipper onboarding or partnership, drop us a message." />
      <section className="container-max grid gap-8 py-16 lg:grid-cols-[1.2fr_1fr]">
        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8"
        >
          <h2 className="font-display text-2xl font-bold text-navy">Send us a message</h2>
          <p className="mt-1 text-sm text-muted-foreground">A dispatcher will respond within one business hour.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { l: "First name", n: "first" },
              { l: "Last name", n: "last" },
              { l: "Company", n: "company" },
              { l: "Phone", n: "phone" },
            ].map((f) => (
              <label key={f.n} className="text-sm">
                <span className="mb-1 block font-medium text-navy">{f.l}</span>
                <input required name={f.n} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </label>
            ))}
          </div>
          <label className="mt-4 block text-sm">
            <span className="mb-1 block font-medium text-navy">Email</span>
            <input required type="email" name="email" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>
          <label className="mt-4 block text-sm">
            <span className="mb-1 block font-medium text-navy">How can we help?</span>
            <textarea required rows={5} name="msg" className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>
          <button type="submit" className="mt-6 w-full rounded-xl bg-primary-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.01]">
            {sent ? "Message received ✓" : "Send to dispatch"}
          </button>
        </form>

        <div className="space-y-4">
          {[
            { i: FaHeadset, l: "24/7 Dispatch Line", v: "1-800-TRUCK-01" },
            { i: FaPhoneAlt, l: "Shipper Sales", v: "1-800-458-2200" },
            { i: FaEnvelope, l: "General Email", v: "dispatch@trucking-1.com" },
            { i: FaMapMarkerAlt, l: "HQ Address", v: "4820 Freight Corridor Blvd, Dallas, TX 75201" },
          ].map((c) => (
            <div key={c.l} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-gradient text-primary-foreground"><c.i className="h-5 w-5" /></span>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.l}</div>
                <div className="mt-0.5 font-semibold text-navy">{c.v}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
