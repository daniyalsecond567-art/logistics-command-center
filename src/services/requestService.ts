import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";

export interface UserRequest {
  id: string;
  text: string;
  status: "Pending" | "Completed";
  createdAt: Timestamp | null;
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
}

export async function listRequests(): Promise<UserRequest[]> {
  const { db } = getFirebase();
  const q = query(collection(db, COLL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UserRequest, "id">) }));
}

export async function deleteRequest(id: string) {
  const { db } = getFirebase();
  await deleteDoc(doc(db, COLL, id));
}
