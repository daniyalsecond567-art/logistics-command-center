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
}

export async function renameTraining(id: string, title: string, description: string) {
  const { db } = getFirebase();
  await updateDoc(doc(db, COLL, id), { title, description });
}

export async function deleteTraining(id: string) {
  const { db } = getFirebase();
  await deleteDoc(doc(db, COLL, id));
}
