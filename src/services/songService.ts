import { logActivity } from "@/services/activityService";
import { collection, deleteDoc, updateDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, type Timestamp } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { getAnonId } from "@/services/favouritesService";

export interface TrainingSong {
  id: string;
  title: string;
  sourceUrl: string;
  videoId: string;
  type: "youtube";
  creatorId: string;
  createdAt: Timestamp | null;
}

const COLL = "trainingSongs";

/** Returns the 11-char YouTube video ID, or null if the URL isn't a valid YouTube video link. */
export function parseYouTubeId(raw: string): string | null {
  let u: URL;
  try { u = new URL(raw.trim()); } catch { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  const host = u.hostname.replace(/^(www\.|m\.|music\.)/, "");
  let id: string | null = null;
  if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0] ?? null;
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") id = u.searchParams.get("v");
    else {
      const m = u.pathname.match(/^\/(shorts|embed|live|v)\/([^/?#]+)/);
      id = m?.[2] ?? null;
    }
  }
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

export async function listSongs(): Promise<TrainingSong[]> {
  const { db } = getFirebase();
  const snap = await getDocs(query(collection(db, COLL), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TrainingSong, "id">) }));
}

export async function addSong(url: string, title: string): Promise<TrainingSong> {
  const clean = title.trim();
  if (!clean || clean.length > 60) throw new Error("Title must be 1–60 characters.");
  const videoId = parseYouTubeId(url);
  if (!videoId) throw new Error("Please enter a valid YouTube video URL.");
  const { db, auth } = getFirebase();
  const ref = doc(db, COLL, `yt_${videoId}`);
  if ((await getDoc(ref)).exists()) throw new Error("This song is already in the Training Center.");
  const data = {
    title: clean,
    sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
    videoId,
    type: "youtube" as const,
    creatorId: auth.currentUser?.uid ?? getAnonId(),
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, data);
  logActivity("Song added", `${clean} (${data.sourceUrl})`);
  return { id: ref.id, ...data, createdAt: null };
}

export async function renameSong(id: string, title: string) {
  const clean = title.trim();
  if (!clean || clean.length > 60) throw new Error("Title must be 1–60 characters.");
  const { db } = getFirebase();
  await updateDoc(doc(db, COLL, id), { title: clean });
  logActivity("Song renamed", clean);
}

export async function deleteSong(id: string) {
  const { db } = getFirebase();
  await deleteDoc(doc(db, COLL, id));
  logActivity("Song deleted", id);
}
