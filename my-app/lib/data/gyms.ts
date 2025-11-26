import { supabase } from '@/lib/auth/client';
import { Gym } from '@/lib/auth/types';

export async function getAllGyms(): Promise<Gym[]> {
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createGym(name: string): Promise<Gym> {
  const { data, error } = await supabase
    .from('gyms')
    .insert([{ name }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getGymById(id: string): Promise<Gym | null> {
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

