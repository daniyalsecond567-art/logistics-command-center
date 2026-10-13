import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, serverTimestamp, type Timestamp } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { getAnonId } from "@/services/favouritesService";

/** Admin change history. Logging is fire-and-forget and never breaks the action itself. */
export interface ActivityEntry {
  id: string;
  action: string;
  detail: string;
  actor: string;
  device: string;
  createdAt: Timestamp | null;
}

const COLL = "activityLog";

export function describeDevice(): string {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  const os = /Android/i.test(ua) ? "Android" : /iPhone|iPad|iPod/i.test(ua) ? "iOS" : /Windows/i.test(ua) ? "Windows"
    : /Mac OS X/i.test(ua) ? "macOS" : /Linux/i.test(ua) ? "Linux" : "Other OS";
  const br = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox"
    : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const kind = /Mobi|Android|iPhone/i.test(ua) ? "Mobile" : /iPad|Tablet/i.test(ua) ? "Tablet" : "Desktop";
  return `${kind} · ${os} · ${br}`.slice(0, 80);
}

export function logActivity(action: string, detail = "") {
  try {
    const { db, auth } = getFirebase();
    const u = auth.currentUser;
    void addDoc(collection(db, COLL), {
      action: action.slice(0, 40),
      detail: detail.slice(0, 200),
      actor: (u ? u.email ?? `user:${u.uid}` : `visitor:${getAnonId().slice(0, 8)}`).slice(0, 100),
      device: describeDevice(),
      createdAt: serverTimestamp(),
    }).catch(() => { /* ignore: history must never block the real action */ });
  } catch { /* ignore */ }
}

export async function listActivity(max = 300): Promise<ActivityEntry[]> {
  const { db } = getFirebase();
  const snap = await getDocs(query(collection(db, COLL), orderBy("createdAt", "desc"), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ActivityEntry, "id">) }));
}

export async function deleteActivity(id: string) {
  const { db } = getFirebase();
  await deleteDoc(doc(db, COLL, id));
}
