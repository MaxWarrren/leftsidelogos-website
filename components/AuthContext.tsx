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
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
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

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        await fetchUserData(currentSession.user.id);
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // Small delay to let the trigger create the profile
        if (event === 'SIGNED_IN') {
          setTimeout(() => fetchUserData(newSession.user.id), 500);
        } else {
          await fetchUserData(newSession.user.id);
        }
      } else {
        setProfile(null);
        setOrganization(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── Sign In ───
  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    setIsAuthModalOpen(false);
    return { error: null };
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

    // If auto-confirmed (e.g. in dev), create org now
    if (data.user && data.session) {
      await createOrganizationForUser(data.user.id, orgName);
      setIsAuthModalOpen(false);
    }

    return { error: null, needsConfirmation: false };
  };

  // ─── Create Organization ───
  const createOrganizationForUser = async (userId: string, orgName: string) => {
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
      return;
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
      return;
    }

    setOrganization(org);
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
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
