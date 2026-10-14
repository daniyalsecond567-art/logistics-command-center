import { logActivity, readActivityFields } from "@/services/activityService";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";

export type RequestStatus = "Pending" | "Approved" | "Declined";

export interface UserRequest {
  id: string;
  text: string;
  status: RequestStatus;
  createdAt: Timestamp | null;
  decidedAt?: Timestamp | null;
  decision?: "Approved" | "Declined";
}

const COLL = "userRequests";

export async function createRequest(text: string) {
  const clean = text.trim().slice(0, 20);
  if (!clean) throw new Error("Request cannot be empty.");
  const { db } = getFirebase();
  await addDoc(collection(db, COLL), {
    text: clean,
    status: "Pending",
    createdAt: serverTimestamp(),
  });
  logActivity("Request submitted", clean);
}

export async function createIssue(text: string) {
  const clean = text.trim().slice(0, 300);
  if (!clean) throw new Error("Please describe the issue.");
  const { db } = getFirebase();
  await addDoc(collection(db, "userIssues"), {
    text: clean,
    status: "Open",
    createdAt: serverTimestamp(),
  });
  logActivity("Issue reported", clean);
}

export async function listRequests(): Promise<UserRequest[]> {
  const { db } = getFirebase();
  const q = query(collection(db, COLL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UserRequest, "id">) }));
}

export async function listPendingRequests(): Promise<UserRequest[]> {
  const { db } = getFirebase();
  const q = query(collection(db, COLL), where("status", "==", "Pending"));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UserRequest, "id">) }));
  return rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
}

export async function listHistoryRequests(): Promise<UserRequest[]> {
  const { db } = getFirebase();
  const q = query(collection(db, COLL), where("status", "in", ["Approved", "Declined"]));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UserRequest, "id">) }));
  return rows.sort((a, b) => {
    const av = a.decidedAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? 0;
    const bv = b.decidedAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? 0;
    return bv - av;
  });
}

export async function decideRequest(id: string, decision: "Approved" | "Declined") {
  const { db } = getFirebase();
  const before = await readActivityFields(COLL, id);
  await updateDoc(doc(db, COLL, id), {
    status: decision,
    decision,
    decidedAt: serverTimestamp(),
  });
  logActivity(`Request ${decision.toLowerCase()}`, typeof before.text === "string" ? before.text : `Request ${id}`);
}

export async function deleteRequest(id: string) {
  const { db } = getFirebase();
  const before = await readActivityFields(COLL, id);
  await deleteDoc(doc(db, COLL, id));
  logActivity("Request deleted", typeof before.text === "string" ? before.text : `Request ${id}`);
}
