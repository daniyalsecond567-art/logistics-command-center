import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { logActivity } from "@/services/activityService";

/** Admin-controlled visibility of Training page options (siteConfig/features). Missing = visible. */
export type FeatureKey = "addRequest" | "addSong" | "reportIssue" | "favourites";
export type FeatureFlags = Record<FeatureKey, boolean>;

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  addRequest: "Add Request button",
  addSong: "Add Song button",
  reportIssue: "Report an Issue button",
  favourites: "Favourites (hearts & tab)",
};

export const DEFAULT_FEATURES: FeatureFlags = { addRequest: true, addSong: true, reportIssue: true, favourites: true };

export function normalizeFeatures(data: Record<string, unknown> | undefined): FeatureFlags {
  const out = { ...DEFAULT_FEATURES };
  for (const k of Object.keys(out) as FeatureKey[]) if (data?.[k] === false) out[k] = false;
  return out;
}

export function subscribeFeatures(cb: (f: FeatureFlags) => void): () => void {
  try {
    const { db } = getFirebase();
    return onSnapshot(doc(db, "siteConfig", "features"), (s) => cb(normalizeFeatures(s.data())), () => cb(DEFAULT_FEATURES));
  } catch { cb(DEFAULT_FEATURES); return () => {}; }
}

export async function setFeature(key: FeatureKey, enabled: boolean) {
  const { db } = getFirebase();
  await setDoc(doc(db, "siteConfig", "features"), { [key]: enabled, updatedAt: serverTimestamp() }, { merge: true });
  logActivity(enabled ? "Feature shown" : "Feature hidden", FEATURE_LABELS[key]);
}
