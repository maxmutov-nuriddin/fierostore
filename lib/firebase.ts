import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyAu4KM7VeC0OoCjJzNwbtdlc_n7xDEqF6M",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "fierostore.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "fierostore",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "fierostore.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "458180229206",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:458180229206:web:ed453dfbfd174c85a123f7",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-L41CHJCJF8"
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.appId
);

const app = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export const storage = app ? getStorage(app) : null;
export const analyticsPromise =
  app && typeof window !== "undefined"
    ? isSupported().then((supported) => (supported ? getAnalytics(app) : null))
    : Promise.resolve(null);

export async function signInAdmin(email: string, password: string) {
  if (!auth) {
    throw new Error("Firebase Auth is not configured.");
  }

  await setPersistence(auth, browserLocalPersistence);
  const credentials = await signInWithEmailAndPassword(auth, email, password);

  return credentials.user;
}

export async function signOutAdmin() {
  if (!auth) return;

  await signOut(auth);
}

export function isAdminUser(user: User | null) {
  if (!user) return false;

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  return adminEmail ? user.email === adminEmail : true;
}

export async function uploadImage(file: File, path: string) {
  if (!storage) {
    return Promise.resolve(URL.createObjectURL(file));
  }

  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);

  return getDownloadURL(storageRef);
}

export function shouldUseLocalFallback(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";

  return [
    "permission-denied",
    "failed-precondition",
    "unavailable",
    "not-found"
  ].some((suffix) => code.endsWith(suffix));
}
