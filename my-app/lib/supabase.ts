import { createClient } from '@supabase/supabase-js'

// Use environment variables for production, fallback to hardcoded values for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zoddbringdphqyrkwpfe.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZGRicmluZ2RwaHF5cmt3cGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTQ3MDAsImV4cCI6MjA3OTYzMDcwMH0.U3W-u_poRkgS90r7_OUZYnFoFlwxpLDCkrChhn32nvg";

// Log connection details (without exposing full key)
console.log('🔌 Initializing Supabase client...');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection on initialization
if (typeof window !== 'undefined') {
  console.log('✅ Supabase client created');
}

