import { supabase } from './client';
import { AuthUser, UserRole } from './types';

export async function signIn(email: string, password: string) {
  // Ensure inputs are trimmed (defensive check)
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  // Validate inputs
  if (!trimmedEmail || !trimmedPassword) {
    throw new Error('Email and password are required.');
  }

  // Log for debugging (without exposing password)
  console.log('🔐 SignIn attempt:', {
    email: trimmedEmail,
    emailLength: trimmedEmail.length,
    passwordLength: trimmedPassword.length,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password: trimmedPassword,
  });

  if (error) {
    console.error('❌ Supabase auth error:', {
      message: error.message,
      status: error.status,
      name: error.name
    });

    // Provide more specific error messages
    if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid credentials')) {
      throw new Error('Invalid email or password. Please check your credentials.');
    } else if (error.message.includes('Email not confirmed')) {
      throw new Error('Please confirm your email before signing in.');
    } else if (error.message.includes('Too many requests')) {
      throw new Error('Too many login attempts. Please wait a few minutes and try again.');
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
      console.error('❌ User not found in users table:', userError);
      throw new Error('User account not found. Please contact administrator.');
    }
  }

  return data;
}

export async function signOut() {
  // Sign out from Supabase (this clears session and cookies)
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
  // Note: Supabase SSR automatically clears cookies on signOut()
  // The createBrowserClient handles cookie clearing automatically
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

// Helper function to get raw auth user (for middleware compatibility)
export async function getAuthUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  // Use getSession() which reads from cookies/localStorage
  // This ensures session persistence across page refreshes
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
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

