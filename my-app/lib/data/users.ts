import { supabase } from '@/lib/auth/client';
import { User, UserRole } from '@/lib/auth/types';

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createUser(
  email: string,
  password: string,
  role: UserRole,
  gym_id: string | null
): Promise<User> {
  // First create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    throw new Error('Failed to create auth user');
  }

  // Then create user record
  const { data, error } = await supabase
    .from('users')
    .insert([{
      id: authData.user.id,
      email,
      role,
      gym_id,
    }])
    .select()
    .single();

  if (error) {
    // Cleanup: delete auth user if user record creation fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw error;
  }

  return data;
}

export async function updateUser(
  id: string,
  updates: { role?: UserRole; gym_id?: string | null }
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteUser(id: string): Promise<void> {
  // Delete user record (auth user will be deleted via CASCADE)
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

