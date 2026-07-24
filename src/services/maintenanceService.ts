import { doc, onSnapshot, serverTimestamp, setDoc, type Timestamp } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";

export interface MaintenanceState {
  enabled: boolean;
  updatedAt?: Timestamp | null;
  updatedBy?: string | null;
}

const COLL = "siteConfig";
const DOC = "maintenance";

export function subscribeMaintenance(cb: (s: MaintenanceState) => void): () => void {
  const { db } = getFirebase();
  return onSnapshot(
    doc(db, COLL, DOC),
    (snap) => {
      const data = snap.data() as Partial<MaintenanceState> | undefined;
      cb({
        enabled: Boolean(data?.enabled),
        updatedAt: data?.updatedAt ?? null,
        updatedBy: data?.updatedBy ?? null,
      });
    },
    () => cb({ enabled: false }),
  );
}

export async function setMaintenance(enabled: boolean, email: string) {
  const { db } = getFirebase();
  await setDoc(
    doc(db, COLL, DOC),
    { enabled, updatedAt: serverTimestamp(), updatedBy: email },
    { merge: true },
  );
}
