import { logActivity, readActivityFields, resourceDetail } from "@/services/activityService";
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
  type Timestamp,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";

export interface TrainingAudio {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  displayOrder: number;
  createdAt: Timestamp | null;
}

const COLL = "trainingAudio";

export async function listTraining(): Promise<TrainingAudio[]> {
  const { db } = getFirebase();
  const q = query(collection(db, COLL), orderBy("displayOrder", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TrainingAudio, "id">) }));
}

export async function createTraining(input: Omit<TrainingAudio, "id" | "createdAt">) {
  const { db } = getFirebase();
  await addDoc(collection(db, COLL), { ...input, createdAt: serverTimestamp() });
  logActivity("Brief added", input.title);
}

export async function renameTraining(id: string, title: string, description: string) {
  const { db } = getFirebase();
  const before = await readActivityFields(COLL, id);
  await updateDoc(doc(db, COLL, id), { title, description });
  const changes: string[] = [];
  if (before.title !== title) changes.push(`Title: ${resourceDetail(id, typeof before.title === "string" ? before.title : undefined)} → “${title}”`);
  if (before.description !== description) changes.push(`Note: “${typeof before.description === "string" ? before.description : ""}” → “${description}”`);
  if (changes.length) logActivity("Brief updated", `“${title}” — ${changes.join("; ")}`);
}

export async function deleteTraining(id: string) {
  const { db } = getFirebase();
  const before = await readActivityFields(COLL, id);
  await deleteDoc(doc(db, COLL, id));
  logActivity("Brief deleted", resourceDetail(id, typeof before.title === "string" ? before.title : undefined));
}
