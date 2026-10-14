import { doc, getDoc, serverTimestamp, setDoc, type Timestamp } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { logActivity, readActivityFields } from "@/services/activityService";

export interface TermsSection { title: string; body: string }
export interface TermsDoc { sections: TermsSection[]; updatedAt: Timestamp | null }

/** Fixed date of the original built-in terms (shown until an admin edits them). */
export const DEFAULT_TERMS_DATE = new Date("2026-10-13T00:00:00Z");

export const DEFAULT_TERMS: TermsSection[] = [
  { title: "Demonstration Notice", body: 'This website ("Trucking-1") is a personal demonstration project created solely for learning, user-interface demonstration, and entertainment purposes. It is not an official trucking, logistics, freight, dispatch, transportation, or fleet management platform, and it is not affiliated with any real carrier or operator.' },
  { title: "No Real Services", body: "No real dispatching, freight booking, carrier operations, driver management, or transportation services are provided through this website. All actions performed inside the application are simulated for demonstration purposes only." },
  { title: "Fictional Content", body: "Any names, truck information, driver briefs, fleet statistics, training materials, load boards, reports, or other content displayed on this website are fictional, generated, or used strictly for demonstration purposes. Any resemblance to real persons, companies, or operations is coincidental." },
  { title: "No Reliance", body: 'The website must not be relied upon for any real business operation, regulatory filing, dispatch decision, safety-critical activity, or commercial transaction. The content is provided "as is" without warranties of any kind.' },
  { title: "Limitation of Liability", body: "The creators of this website accept no responsibility or liability for any misuse, loss, damage, or consequence arising from the use, misuse, or inability to use this demonstration website." },
  { title: "Acknowledgement", body: "By accessing or using this website, you acknowledge and agree that it is a demonstration application created for educational, illustrative, and entertainment purposes only, and you accept these terms in full." },
];

const REF = ["siteConfig", "terms"] as const;

export async function getTerms(): Promise<TermsDoc | null> {
  const { db } = getFirebase();
  const snap = await getDoc(doc(db, ...REF));
  if (!snap.exists()) return null;
  const d = snap.data();
  const sections = Array.isArray(d.sections) ? (d.sections as TermsSection[]) : [];
  return sections.length ? { sections, updatedAt: (d.updatedAt as Timestamp) ?? null } : null;
}

export async function saveTerms(sections: TermsSection[], email: string) {
  const clean = sections
    .map((s) => ({ title: s.title.trim().slice(0, 120), body: s.body.trim().slice(0, 4000) }))
    .filter((s) => s.title || s.body);
  if (!clean.length) throw new Error("Add at least one section.");
  const { db } = getFirebase();
  const before = await readActivityFields(...REF);
  const previous = Array.isArray(before.sections) ? before.sections as TermsSection[] : DEFAULT_TERMS;
  await setDoc(doc(db, ...REF), { sections: clean, updatedAt: serverTimestamp(), updatedBy: email });
  for (const section of clean) {
    const old = previous.find((s) => s.title === section.title);
    if (!old) logActivity("Terms section added", section.title || "Untitled section");
    else if (old.body !== section.body) logActivity("Terms section updated", `${section.title || "Untitled section"} — section text changed`);
  }
  for (const section of previous) {
    if (!clean.some((s) => s.title === section.title)) logActivity("Terms section removed", section.title || "Untitled section");
  }
}
