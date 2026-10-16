import { collection, doc, getDocs, increment, onSnapshot, serverTimestamp, setDoc, updateDoc, deleteDoc, type Timestamp } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { getAnonId } from "@/services/favouritesService";

/** Named visitors: unique id cached on the device (getAnonId) + name cached locally and mirrored to Firestore. */
export interface Visitor {
  id: string;
  name: string;
  askAgain?: boolean;
  createdAt?: Timestamp | null;
  lastSeen?: Timestamp | null;
  totalSeconds?: number;
  lastActivity?: string;
  device?: string;
}

const COLL = "visitors";
const NAME_KEY = "trucking1.visitorName.v1";
export const HEARTBEAT_SECONDS = 30;
export const LIVE_WINDOW_MS = 75_000;

export function getVisitorName(): string | null {
  try { return localStorage.getItem(NAME_KEY); } catch { return null; }
}

export async function saveVisitorName(name: string, device: string) {
  const clean = name.trim().slice(0, 40);
  try { localStorage.setItem(NAME_KEY, clean); } catch { /* keep going */ }
  const { db } = getFirebase();
  await setDoc(doc(db, COLL, getAnonId()), { name: clean, askAgain: false, device: device.slice(0, 80), lastSeen: serverTimestamp() }, { merge: true });
}

export function clearVisitorName() {
  try { localStorage.removeItem(NAME_KEY); } catch { /* ignore */ }
}

/** Watches this device's visitor record so an admin "ask again" request shows up live. */
export function subscribeOwnVisitor(cb: (v: Partial<Visitor> | null) => void): () => void {
  try {
    const { db } = getFirebase();
    return onSnapshot(doc(db, COLL, getAnonId()), (s) => cb(s.exists() ? (s.data() as Partial<Visitor>) : null), () => cb(null));
  } catch { return () => {}; }
}

export async function heartbeat(seconds: number) {
  if (!getVisitorName()) return;
  const { db } = getFirebase();
  await setDoc(doc(db, COLL, getAnonId()), { lastSeen: serverTimestamp(), totalSeconds: increment(seconds) }, { merge: true });
}

export function noteVisitorActivity(text: string) {
  if (!getVisitorName()) return;
  try {
    const { db } = getFirebase();
    void setDoc(doc(db, COLL, getAnonId()), { lastActivity: text.slice(0, 200), lastSeen: serverTimestamp() }, { merge: true }).catch(() => {});
  } catch { /* ignore */ }
}

export async function listVisitors(): Promise<Visitor[]> {
  const { db } = getFirebase();
  const snap = await getDocs(collection(db, COLL));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Visitor, "id">) }))
    .sort((a, b) => (b.lastSeen?.toMillis?.() ?? 0) - (a.lastSeen?.toMillis?.() ?? 0));
}

export async function askVisitorAgain(id: string) {
  const { db } = getFirebase();
  await updateDoc(doc(db, COLL, id), { askAgain: true });
}

export async function deleteVisitor(id: string) {
  const { db } = getFirebase();
  await deleteDoc(doc(db, COLL, id));
}

export function isLive(v: Visitor, now = Date.now()) {
  const t = v.lastSeen?.toMillis?.();
  return !!t && now - t < LIVE_WINDOW_MS;
}

export function formatSeconds(total = 0) {
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60);
  return h ? `${h}h ${m}m` : m ? `${m}m` : `${total}s`;
}
