import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
}

interface UserOrganization {
  id: string;
  name: string;
  access_code: string | null;
}

// Options recognized by openAuthModal. All fields are optional; legacy callers
// can keep invoking openAuthModal() with no args and get the default sign-in
// modal.
export interface OpenAuthModalOptions {
  mode?: 'signin' | 'signup';
  message?: string;          // contextual headline rendered above the form
  required?: boolean;        // disables backdrop/ESC dismissal
  onClose?: () => void;      // invoked when the user dismisses or completes
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  organization: UserOrganization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, orgName: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  openAuthModal: (opts?: OpenAuthModalOptions) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalOptions: OpenAuthModalOptions;
  isRecoveringPassword: boolean;
  setIsRecoveringPassword: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<UserOrganization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalOptions, setAuthModalOptions] = useState<OpenAuthModalOptions>({});
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);

  // Fetch profile and org for a given user
  const fetchUserData = async (userId: string) => {
    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('id', userId)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    // Fetch organization membership
    const { data: memberData } = await supabase
      .from('organization_members')
      .select('organization_id, organizations(id, name, access_code)')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (memberData?.organizations) {
      const org = memberData.organizations as unknown as UserOrganization;
      setOrganization(org);
    }
  };

  // Initialize auth state.
  //
  // supabase-js fires `onAuthStateChange` with an INITIAL_SESSION event on
  // mount (with the restored session or null), so this listener alone covers
  // cold-load session restore — no separate getSession() call needed.
  //
  // CRITICAL: the callback runs while GoTrueClient holds its internal auth
  // lock. We must NOT `await` any Supabase call inside it — a nested request
  // waits on that same lock and deadlocks, which hangs BOTH the profile fetch
  // and any concurrent catalog read until a manual page refresh. So every
  // Supabase follow-up (fetchUserData) is deferred out of the callback with
  // setTimeout, letting the lock release first.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveringPassword(true);
        setIsAuthModalOpen(true);
      }

      if (newSession?.user) {
        const userId = newSession.user.id;
        // SIGNED_IN may be a brand-new signup whose profile row is still being
        // created by the DB trigger — give it a beat. Other events resolve
        // immediately (but always off the callback stack to avoid the lock).
        const delay = event === 'SIGNED_IN' ? 500 : 0;
        setTimeout(() => fetchUserData(userId), delay);
      } else {
        setProfile(null);
        setOrganization(null);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── Sign In ───
  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    setIsAuthModalOpen(false);

    // One-time backfill: legacy users created before org-required-at-signup
    // may have zero memberships. Auto-create "{Name}'s Account" so every
    // signed-in user has an org. Best-effort, non-blocking.
    const signedInUser = data?.user;
    if (signedInUser) {
      backfillOrgIfMissing(signedInUser.id).catch((err) => {
        console.warn('Org backfill skipped:', err);
      });
    }
    return { error: null };
  };

  // Look up org membership count for a user; if zero AND we can resolve a
  // display name, spin up "{Name}'s Account" and add them as owner.
  const backfillOrgIfMissing = async (userId: string) => {
    const { count, error: countErr } = await supabase
      .from('organization_members')
      .select('user_id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (countErr) return;
    if ((count ?? 0) > 0) return;

    const { data: profileRow } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();
    const fullName = profileRow?.full_name?.trim();
    if (!fullName) return;

    await createOrganizationForUser(userId, `${fullName}'s Account`);
  };

  // ─── Sign Up (with org auto-creation) ───
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    orgName: string
  ): Promise<{ error: string | null; needsConfirmation: boolean }> => {
    // 1. Create the auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          organization_name: orgName,
        },
      },
    });

    if (error) return { error: error.message, needsConfirmation: false };

    // If email confirmation is required
    if (data.user && !data.session) {
      return { error: null, needsConfirmation: true };
    }

    // If auto-confirmed (e.g. in dev), create org now. Surface any failure
    // back to the caller so the modal can display it — we can't roll back the
    // auth.users insert from the browser, so this is best-effort.
    if (data.user && data.session) {
      const orgErr = await createOrganizationForUser(data.user.id, orgName);
      if (orgErr) {
        return { error: orgErr, needsConfirmation: false };
      }
      setIsAuthModalOpen(false);
    }

    return { error: null, needsConfirmation: false };
  };

  // ─── Create Organization ───
  // Returns a non-null error string if either insert failed so callers can
  // surface it to the user. Supabase doesn't expose client-side transactions,
  // so this is best-effort — the auth.users row is left intact on failure.
  const createOrganizationForUser = async (
    userId: string,
    orgName: string,
  ): Promise<string | null> => {
    // Generate a random 8-character access code
    const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Create the organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: orgName, access_code: accessCode })
      .select('id, name, access_code')
      .single();

    if (orgError || !org) {
      console.error('Failed to create organization:', orgError);
      return orgError?.message ?? 'Failed to create your workspace.';
    }

    // Add user as owner
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: userId,
        role: 'owner',
      });

    if (memberError) {
      console.error('Failed to add user to organization:', memberError);
      return memberError.message;
    }

    setOrganization(org);
    return null;
  };

  // ─── Sign Out ───
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setOrganization(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        organization,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        openAuthModal: (opts?: OpenAuthModalOptions) => {
          setAuthModalOptions(opts ?? {});
          setIsAuthModalOpen(true);
        },
        closeAuthModal: () => {
          // Fire the consumer's onClose hook before tearing down state so
          // callers can navigate or follow-up cleanly.
          authModalOptions.onClose?.();
          setIsAuthModalOpen(false);
          setAuthModalOptions({});
        },
        isAuthModalOpen,
        authModalOptions,
        isRecoveringPassword,
        setIsRecoveringPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
