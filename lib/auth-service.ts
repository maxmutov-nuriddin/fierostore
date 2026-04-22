import { apiRequest, clearAuthToken, readAuthToken, storeAuthToken } from "@/lib/api-client";
import type { AppUser, CustomerProfile } from "@/lib/types";

const SESSION_STORAGE_KEY = "fierostore.auth-session";

type SessionPayload = {
  token: string;
  user: AppUser;
  profile: CustomerProfile;
};

type AuthStatePayload = {
  user: AppUser | null;
  profile: CustomerProfile | null;
  isAdmin: boolean;
};

function setLocalSession(session: SessionPayload | null) {
  if (typeof window === "undefined") return;

  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    clearAuthToken();
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  storeAuthToken(session.token);
}

function readStoredSession() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionPayload;
  } catch {
    return null;
  }
}

function toAuthState(session: SessionPayload | null): AuthStatePayload {
  return {
    user: session?.user ?? null,
    profile: session?.profile ?? null,
    isAdmin: session?.user?.role === "admin"
  };
}

async function createSession(path: string, body: Record<string, unknown>) {
  const session = await apiRequest<SessionPayload>(path, {
    method: "POST",
    body,
    token: null
  });

  setLocalSession(session);
  return session;
}

export function readLocalSession() {
  return readStoredSession()?.profile ?? null;
}

export function readLocalAuthState() {
  return toAuthState(readStoredSession());
}

export async function registerCustomer(input: {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
}) {
  return createSession("/auth/register", input);
}

export async function loginCustomer(input: { phone: string; password: string }) {
  return createSession("/auth/login", input);
}

export async function loginAdmin(input: { email: string; password: string }) {
  return createSession("/auth/admin/login", input);
}

export async function logoutCustomer() {
  try {
    if (readAuthToken()) {
      await apiRequest("/auth/logout", { method: "POST" });
    }
  } finally {
    setLocalSession(null);
  }
}

export function watchAuthState(callback: (payload: AuthStatePayload) => void) {
  const localSession = readStoredSession();
  callback(toAuthState(localSession));

  if (!localSession?.token) {
    return () => undefined;
  }

  let active = true;

  void apiRequest<SessionPayload>("/auth/me")
    .then((session) => {
      if (!active) return;
      setLocalSession(session);
      callback(toAuthState(session));
    })
    .catch(() => {
      if (!active) return;
      setLocalSession(null);
      callback(toAuthState(null));
    });

  return () => {
    active = false;
  };
}
