// Auth + role context. Wraps Supabase session + user_roles lookup.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

import { roleFlags, type Role } from "@/lib/role-flags";

export type { Role };

type AuthState = {
  user: User | null;
  session: Session | null;
  roles: Role[];
  loading: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  isWriter: boolean;
  canPublish: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener FIRST, then check session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      if (s?.user) {
        // Defer role fetch to avoid deadlocking the auth callback.
        setTimeout(() => fetchRoles(s.user.id), 0);
      } else {
        setRoles([]);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) fetchRoles(data.session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchRoles(userId: string) {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    setRoles((data ?? []).map((r) => r.role as Role));
  }

  const value: AuthState = {
    user: session?.user ?? null,
    session,
    roles,
    loading,
    ...roleFlags(roles),
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message };
    },
    async signUp(email, password) {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      // Email confirmation is on: signUp returns no session until the address
      // is verified, so this is a "check your email" state, not a signed-in one.
      return { error: error?.message, needsConfirmation: !error && !data.session };
    },
    async signOut() {
      await supabase.auth.signOut();
    },
    async resetPassword(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error: error?.message };
    },
    async updatePassword(password) {
      const { error } = await supabase.auth.updateUser({ password });
      return { error: error?.message };
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
