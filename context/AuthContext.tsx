"use client";

import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  loginAdmin as loginAdminService,
  loginCustomer,
  logoutCustomer,
  readLocalAuthState,
  registerCustomer,
  watchAuthState
} from "@/lib/auth-service";
import type { AppUser, CustomerProfile } from "@/lib/types";

type AuthContextValue = {
  user: AppUser | null;
  profile: CustomerProfile | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (input: {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  login: (input: { phone: string; password: string }) => Promise<void>;
  loginAdmin: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = watchAuthState(({ user: nextUser, profile: nextProfile, isAdmin: nextIsAdmin }) => {
      setUser(nextUser);
      setProfile(nextProfile);
      setIsAdmin(nextIsAdmin);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isAdmin,
      isAuthenticated: Boolean(user || profile),
      isLoading,
      async register(input) {
        const result = await registerCustomer(input);
        setUser(result.user);
        setProfile(result.profile);
        setIsAdmin(false);
      },
      async login(input) {
        const result = await loginCustomer(input);
        setUser(result.user);
        setProfile(result.profile);
        setIsAdmin(result.user.role === "admin");
      },
      async loginAdmin(input) {
        const result = await loginAdminService(input);
        setUser(result.user);
        setProfile(result.profile);
        setIsAdmin(result.user.role === "admin");
      },
      async logout() {
        await logoutCustomer();
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
    }),
    [isAdmin, isLoading, profile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
