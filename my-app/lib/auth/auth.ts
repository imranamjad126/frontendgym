import { supabase } from './client';
import { AuthUser, UserRole } from './types';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Provide more specific error messages
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Invalid email or password. Please check your credentials.');
    } else if (error.message.includes('Email not confirmed')) {
      throw new Error('Please confirm your email before signing in.');
    } else {
      throw new Error(error.message || 'Failed to sign in. Please try again.');
    }
  }

  // Verify user exists in users table
  if (data.user) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User account not found. Please contact administrator.');
    }
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    // Fetch user role and gym_id from users table
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, email, role, gym_id')
      .eq('id', user.id)
      .single();

    if (error || !userData) {
      console.error('Error fetching user data:', error);
      return null;
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role as UserRole,
      gym_id: userData.gym_id,
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user = await getCurrentUser();
      callback(user);
    } else {
      callback(null);
    }
  });
}

