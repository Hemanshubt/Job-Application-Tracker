import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isLiveSupabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { profileApi } from '../lib/api';

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  isDemoUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(!isLiveSupabase);

  const fetchProfile = async () => {
    try {
      const p = await profileApi.get();
      setProfile(p);
    } catch (err) {
      console.warn('Failed to load profile:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isLiveSupabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              avatar_url: session.user.user_metadata?.avatar_url,
            });
            setIsDemoUser(false);
            await fetchProfile();
          } else {
            setUser(null);
          }

          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
              if (session?.user) {
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                  avatar_url: session.user.user_metadata?.avatar_url,
                });
                setIsDemoUser(false);
                await fetchProfile();
              } else {
                setUser(null);
                setProfile(null);
              }
            }
          );

          return () => {
            authListener.subscription.unsubscribe();
          };
        } else {
          // Dev / Demo Mode: check stored session
          const stored = localStorage.getItem('demo_user_logged_in');
          if (stored === 'true' || stored === null) {
            // Default logged in as demo user for immediate review
            setUser({
              id: 'demo-user-1234-5678-90ab',
              email: 'alex.developer@example.com',
              full_name: 'Alex Rivera',
              avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            });
            setIsDemoUser(true);
            await fetchProfile();
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      if (isLiveSupabase) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error };
        await fetchProfile();
        return { error: null };
      } else {
        // Mock sign in for demo
        localStorage.setItem('demo_user_logged_in', 'true');
        localStorage.setItem('demo_token', `demo-jwt-${Date.now()}`);
        setUser({
          id: 'demo-user-1234-5678-90ab',
          email: email || 'alex.developer@example.com',
          full_name: email.split('@')[0] || 'Alex Rivera',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        });
        setIsDemoUser(true);
        await fetchProfile();
        return { error: null };
      }
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      if (isLiveSupabase) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) return { error };
        return { error: null };
      } else {
        localStorage.setItem('demo_user_logged_in', 'true');
        setUser({
          id: `user-${Date.now()}`,
          email,
          full_name: fullName,
        });
        setIsDemoUser(true);
        await fetchProfile();
        return { error: null };
      }
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    if (isLiveSupabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('demo_user_logged_in');
    localStorage.removeItem('demo_token');
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    try {
      if (isLiveSupabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) return { error };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshProfile,
        isDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
