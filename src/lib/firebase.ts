import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_C1qOKQVcvTxXxBJjDZrkt3UCjyxvM-Y",
  authDomain: "trucking-1f4a8.firebaseapp.com",
  projectId: "trucking-1f4a8",
  storageBucket: "trucking-1f4a8.firebasestorage.app",
  messagingSenderId: "776582443357",
  appId: "1:776582443357:web:e93bbec3ddcff5621eb8b4",
  measurementId: "G-JYDXB7QG7V",
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getFirebase() {
  if (typeof window === "undefined") {
    // Never initialize on the server; components that use Firebase are client-gated.
    throw new Error("Firebase can only be used in the browser.");
  }
  if (!_app) {
    _app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
    _auth = getAuth(_app);
    _db = getFirestore(_app);
  }
  return { app: _app!, auth: _auth!, db: _db! };
}
