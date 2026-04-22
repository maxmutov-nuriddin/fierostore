import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { auth, db, isAdminUser, isFirebaseConfigured } from "@/lib/firebase";
import type { CustomerProfile } from "@/lib/types";

const PROFILE_STORAGE_KEY = "fierostore.customer-profiles";
const SESSION_STORAGE_KEY = "fierostore.auth-session";

function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

export function phoneToEmail(phone: string) {
  const normalized = normalizePhone(phone);
  return `${normalized}@fierostore.app`;
}

function nowIso() {
  return new Date().toISOString();
}

function getLocalProfiles() {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as Array<CustomerProfile & { password: string }>;
  } catch {
    return [];
  }
}

function setLocalProfiles(profiles: Array<CustomerProfile & { password: string }>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
}

function setLocalSession(profile: CustomerProfile | null) {
  if (typeof window === "undefined") return;

  if (!profile) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
}

export function readLocalSession() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CustomerProfile;
  } catch {
    return null;
  }
}

export async function createCustomerProfile(profile: CustomerProfile) {
  if (!isFirebaseConfigured || !db) {
    return profile;
  }

  await setDoc(doc(db, "users", profile.id), profile, { merge: true });
  return profile;
}

export async function getCustomerProfile(userId: string) {
  if (!isFirebaseConfigured || !db) return null;

  const snapshot = await getDoc(doc(db, "users", userId));
  if (!snapshot.exists()) return null;

  return snapshot.data() as CustomerProfile;
}

export async function registerCustomer(input: {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
}) {
  const phone = normalizePhone(input.phone);
  const email = phoneToEmail(phone);

  if (!isFirebaseConfigured || !auth) {
    const profiles = getLocalProfiles();
    if (profiles.some((entry) => entry.phone === phone)) {
      throw new Error("This phone number is already registered.");
    }

    const profile: CustomerProfile = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `user-${Date.now()}`,
      firstName: input.firstName,
      lastName: input.lastName,
      phone,
      email,
      createdAt: nowIso()
    };

    setLocalProfiles([...profiles, { ...profile, password: input.password }]);
    setLocalSession(profile);

    return { user: null, profile };
  }

  await setPersistence(auth, browserLocalPersistence);
  const credentials = await createUserWithEmailAndPassword(auth, email, input.password);
  await updateProfile(credentials.user, {
    displayName: `${input.firstName} ${input.lastName}`.trim()
  });

  const profile: CustomerProfile = {
    id: credentials.user.uid,
    firstName: input.firstName,
    lastName: input.lastName,
    phone,
    email,
    createdAt: nowIso()
  };

  await createCustomerProfile(profile);

  return { user: credentials.user, profile };
}

export async function loginCustomer(input: { phone: string; password: string }) {
  const phone = normalizePhone(input.phone);
  const email = phoneToEmail(phone);

  if (!isFirebaseConfigured || !auth) {
    const profile = getLocalProfiles().find((entry) => entry.phone === phone && entry.password === input.password);
    if (!profile) {
      throw new Error("Incorrect phone number or password.");
    }

    const sessionProfile: CustomerProfile = {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      email: profile.email,
      createdAt: profile.createdAt
    };

    setLocalSession(sessionProfile);
    return { user: null, profile: sessionProfile };
  }

  await setPersistence(auth, browserLocalPersistence);
  const credentials = await signInWithEmailAndPassword(auth, email, input.password);
  const profile =
    (await getCustomerProfile(credentials.user.uid)) ??
    ({
      id: credentials.user.uid,
      firstName: credentials.user.displayName?.split(" ")[0] ?? "Client",
      lastName: credentials.user.displayName?.split(" ").slice(1).join(" ") ?? "",
      phone,
      email,
      createdAt: nowIso()
    } satisfies CustomerProfile);

  await createCustomerProfile(profile);

  return { user: credentials.user, profile };
}

export async function logoutCustomer() {
  setLocalSession(null);

  if (auth) {
    await signOut(auth);
  }
}

export function watchAuthState(callback: (payload: {
  user: User | null;
  profile: CustomerProfile | null;
  isAdmin: boolean;
}) => void) {
  if (!isFirebaseConfigured || !auth) {
    callback({ user: null, profile: readLocalSession(), isAdmin: false });
    return () => undefined;
  }

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback({ user: null, profile: null, isAdmin: false });
      return;
    }

    const profile =
      (await getCustomerProfile(user.uid)) ??
      ({
        id: user.uid,
        firstName: user.displayName?.split(" ")[0] ?? "Client",
        lastName: user.displayName?.split(" ").slice(1).join(" ") ?? "",
        phone: user.email?.split("@")[0] ?? "",
        email: user.email ?? "",
        createdAt: nowIso()
      } satisfies CustomerProfile);

    callback({ user, profile, isAdmin: isAdminUser(user) });
  });
}
