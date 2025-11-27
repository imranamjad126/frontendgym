'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '@/lib/auth/types';
import { getCurrentUser, getSession, onAuthStateChange, signOut } from '@/lib/auth/auth';
import { useRouter, usePathname } from 'next/navigation';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initial load - check session first
    loadSessionAndUser();

    // Subscribe to auth changes
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      setUser(user);
      // Refresh session when auth state changes
      const currentSession = await getSession();
      setSession(currentSession);
      // Set loading to false after auth state change
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect to login if not authenticated and on protected route
  useEffect(() => {
    if (!loading) {
      const publicRoutes = ['/login', '/register', '/auth/reset'];
      const isPublic = publicRoutes.some(route => 
        pathname === route || pathname.startsWith(route + '/')
      );

      // If not logged in and trying to access protected route
      if (!session && !isPublic) {
        router.push('/login');
      }
    }
  }, [loading, session, pathname, router]);

  const loadSessionAndUser = async () => {
    try {
      // First, get session from Supabase
      const currentSession = await getSession();
      setSession(currentSession);

      // If session exists, load user data
      if (currentSession) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading session/user:', error);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setSession(null);
    router.push('/login');
  };

  const refresh = async () => {
    setLoading(true);
    await loadSessionAndUser();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}



