import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";

/**
 * Training favourites: local cache (localStorage) per identity + Firestore sync
 * for signed-in users. Pending ops are queued so offline changes are never lost
 * and are replayed on top of the latest cloud state (no duplicates, removals kept).
 */
export type FavOp = { id: string; op: "add" | "remove"; ts: number };
export interface FavCache { ids: string[]; pending: FavOp[]; syncedAt: number | null }

const ANON_KEY = "trucking1.anonId.v1";
const CACHE_PREFIX = "trucking1.favs.v1.";
const COLL = "userFavorites";

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, val: string) {
  try { localStorage.setItem(key, val); } catch { /* quota/private mode: keep in memory */ }
}

export function getAnonId(): string {
  let id = safeGet(ANON_KEY);
  if (!id) {
    id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    safeSet(ANON_KEY, id);
  }
  return id;
}

export function identityFor(uid: string | null): string {
  return uid ? `u:${uid}` : `anon:${getAnonId()}`;
}

export function readCache(identity: string): FavCache {
  const raw = safeGet(CACHE_PREFIX + identity);
  if (raw) {
    try {
      const p = JSON.parse(raw) as Partial<FavCache>;
      return {
        ids: Array.isArray(p.ids) ? [...new Set(p.ids.filter((x) => typeof x === "string"))] : [],
        pending: Array.isArray(p.pending) ? p.pending : [],
        syncedAt: typeof p.syncedAt === "number" ? p.syncedAt : null,
      };
    } catch { /* corrupted cache: start fresh, cloud will restore */ }
  }
  return { ids: [], pending: [], syncedAt: null };
}

export function writeCache(identity: string, cache: FavCache) {
  safeSet(CACHE_PREFIX + identity, JSON.stringify(cache));
}

export function applyOps(base: string[], ops: FavOp[]): string[] {
  const set = new Set(base);
  for (const o of [...ops].sort((a, b) => a.ts - b.ts)) {
    if (o.op === "add") set.add(o.id); else set.delete(o.id);
  }
  return [...set];
}

/** Applies pending ops onto the cloud list atomically; returns the merged list. */
export async function syncCloud(uid: string, pending: FavOp[]): Promise<string[]> {
  const { db } = getFirebase();
  const ref = doc(db, COLL, uid);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const cloud = snap.exists() && Array.isArray(snap.data().ids) ? (snap.data().ids as string[]) : [];
    const merged = applyOps(cloud, pending);
    if (pending.length || !snap.exists()) {
      tx.set(ref, { ids: merged, updatedAt: serverTimestamp() });
    }
    return merged;
  });
}
