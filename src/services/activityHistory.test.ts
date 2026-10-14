import { beforeEach, describe, expect, mock, test } from "bun:test";

const records: Record<string, Record<string, unknown>> = {};
const writes: { path: string; data: Record<string, unknown> }[] = [];
const updates: { path: string; data: Record<string, unknown> }[] = [];
const removals: string[] = [];
let denyLookup = false;

mock.module("@/lib/firebase", () => ({ getFirebase: () => ({ db: {}, auth: { currentUser: { email: "admin@example.test" } } }) }));
mock.module("@/services/favouritesService", () => ({ getAnonId: () => "test-visitor" }));
mock.module("firebase/firestore", () => ({
  doc: (_db: unknown, collection: string, id: string) => `${collection}/${id}`,
  collection: (_db: unknown, name: string) => name,
  getDoc: async (path: string) => {
    if (denyLookup) throw new Error("History lookup unavailable");
    return { exists: () => path in records, data: () => records[path] };
  },
  addDoc: async (path: string, data: Record<string, unknown>) => { writes.push({ path, data }); return { id: "new-id" }; },
  setDoc: async (path: string, data: Record<string, unknown>) => { writes.push({ path, data }); },
  updateDoc: async (path: string, data: Record<string, unknown>) => { updates.push({ path, data }); },
  deleteDoc: async (path: string) => { removals.push(path); },
  serverTimestamp: () => "timestamp",
  getDocs: async () => ({ docs: [] }), query: () => ({}), orderBy: () => ({}), where: () => ({}), limit: () => ({}),
}));

const { addSong, renameSong, deleteSong } = await import("./songService");
const { renameTraining, deleteTraining } = await import("./trainingService");
const { decideRequest, deleteRequest } = await import("./requestService");
const { saveTerms } = await import("./termsService");
const { logActivity, resourceDetail } = await import("./activityService");
const history = () => writes.filter((entry) => entry.path === "activityLog").map((entry) => entry.data);

beforeEach(() => {
  for (const key of Object.keys(records)) delete records[key];
  writes.length = 0; updates.length = 0; removals.length = 0; denyLookup = false;
});

describe("specific change history", () => {
  test("song additions retain the submitted title", async () => {
    await addSong("https://youtu.be/abcdefghijk", "Night Drive");
    expect(history()[0]?.detail).toBe("Night Drive (https://www.youtube.com/watch?v=abcdefghijk)");
  });
  test("song renames retain both the old and new titles", async () => {
    records["trainingSongs/song-1"] = { title: "Night Drive" };
    await renameSong("song-1", "Morning Drive");
    expect(history()[0]?.detail).toBe("“Night Drive” → “Morning Drive”");
    expect(updates[0]?.data).toEqual({ title: "Morning Drive" });
  });
  test("song deletion captures its title before removal", async () => {
    records["trainingSongs/song-1"] = { title: "Night Drive" };
    await deleteSong("song-1");
    expect(history()[0]?.detail).toBe("“Night Drive”");
    expect(removals).toEqual(["trainingSongs/song-1"]);
  });
  test("brief changes identify title and note changes", async () => {
    records["trainingAudio/brief-1"] = { title: "Safety", description: "Old note" };
    await renameTraining("brief-1", "Dispatch", "New note");
    expect(history()[0]?.detail).toBe("“Dispatch” — Title: “Safety” → “Dispatch”; Note: “Old note” → “New note”");
  });
  test("brief deletions identify the deleted title", async () => {
    records["trainingAudio/brief-1"] = { title: "Safety" };
    await deleteTraining("brief-1");
    expect(history()[0]?.detail).toBe("“Safety”");
  });
  test("request decisions and deletions retain the request text", async () => {
    records["userRequests/request-1"] = { text: "Safety training" };
    await decideRequest("request-1", "Approved");
    await deleteRequest("request-1");
    expect(history().map((entry) => entry.detail)).toEqual(["Safety training", "Safety training"]);
    expect(updates[0]?.data.status).toBe("Approved");
  });
  test("terms changes identify updated, added and removed sections", async () => {
    records["siteConfig/terms"] = { sections: [{ title: "Safety", body: "Old" }, { title: "Removed", body: "Text" }] };
    await saveTerms([{ title: "Safety", body: "New" }, { title: "Added", body: "Text" }], "admin@example.test");
    expect(history().map((entry) => [entry.action, entry.detail])).toEqual([
      ["Terms section updated", "Safety — section text changed"],
      ["Terms section added", "Added"],
      ["Terms section removed", "Removed"],
    ]);
  });
  test("favourite additions and removals name the resource", () => {
    logActivity("Favourite added", resourceDetail("song-1", "Night Drive"));
    logActivity("Favourite removed", resourceDetail("song-1", "Night Drive"));
    expect(history().map((entry) => [entry.action, entry.detail])).toEqual([
      ["Favourite added", "“Night Drive”"], ["Favourite removed", "“Night Drive”"],
    ]);
  });
  test("failed history lookups do not block deletion", async () => {
    denyLookup = true;
    await deleteSong("song-1");
    expect(removals).toEqual(["trainingSongs/song-1"]);
    expect(history()[0]?.detail).toBe("Resource song-1");
  });
});