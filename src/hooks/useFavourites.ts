import { logActivity } from "@/services/activityService";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { identityFor, readCache, syncCloud, writeCache, applyOps, type FavCache } from "@/services/favouritesService";

export function useFavourites() {
  const { user, loading } = useAuth();
  const uid = user?.uid ?? null;
  const [ids, setIds] = useState<Set<string>>(new Set());
  const identityRef = useRef<string | null>(null);
  const syncing = useRef(false);

  const sync = useCallback(async () => {
    const identity = identityRef.current;
    if (!uid || !identity || syncing.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    syncing.current = true;
    try {
      const snapshot = readCache(identity);
      const sent = snapshot.pending;
      const merged = await syncCloud(uid, sent);
      if (identityRef.current !== identity) return; // user switched mid-sync
      // keep ops added while syncing
      const latest = readCache(identity);
      const sentKeys = new Set(sent.map((o) => `${o.id}|${o.op}|${o.ts}`));
      const remaining = latest.pending.filter((o) => !sentKeys.has(`${o.id}|${o.op}|${o.ts}`));
      const next: FavCache = { ids: applyOps(merged, remaining), pending: remaining, syncedAt: Date.now() };
      writeCache(identity, next);
      setIds(new Set(next.ids));
    } catch {
      /* offline / server error: local cache stays authoritative, retry later */
    } finally {
      syncing.current = false;
    }
  }, [uid]);

  useEffect(() => {
    if (loading) return;
    const identity = identityFor(uid);
    identityRef.current = identity;
    setIds(new Set(readCache(identity).ids)); // instant from cache
    void sync();
    const onOnline = () => void sync();
    const onVisible = () => { if (document.visibilityState === "visible") void sync(); };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    const t = window.setInterval(() => { if (readCache(identity).pending.length) void sync(); }, 30000);
    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(t);
    };
  }, [uid, loading, sync]);

  const toggle = useCallback((id: string) => {
    const identity = identityRef.current;
    if (!identity) return;
    const cache = readCache(identity);
    const has = cache.ids.includes(id);
    const op = { id, op: has ? "remove" : "add", ts: Date.now() } as const;
    const next: FavCache = {
      ids: applyOps(cache.ids, [op]),
      pending: uid ? [...cache.pending.filter((o) => o.id !== id), op] : [],
      syncedAt: cache.syncedAt,
    };
    writeCache(identity, next);
    logActivity(has ? "Favourite removed" : "Favourite added", id);
    setIds(new Set(next.ids));
    if (uid) void sync();
  }, [uid, sync]);

  return { favourites: ids, isFavourite: (id: string) => ids.has(id), toggle, ready: !loading };
}
