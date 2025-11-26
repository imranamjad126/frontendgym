import { supabase } from './supabase';

/**
 * Example function to add a test member to Supabase
 * Adds a member with the specified fields
 */
export async function addMember() {
  try {
    console.log('📝 Adding test member to Supabase...');
    
    const { data, error } = await supabase
      .from("members")
      .insert([{
        name: "Ali",
        phone: "03001234567",
        plan: "monthly",
        start_date: "2025-01-01",
        end_date: "2025-02-01",
        status: "active"
      }])
      .select();

    if (error) {
      console.error('❌ Error adding member:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return { success: false, error };
    }

    console.log('✅ Member added successfully:', data);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Exception adding member:', err);
    return { success: false, error: err };
  }
}

/**
 * Fetch all members from Supabase and log them
 */
export async function fetchAllMembers() {
  try {
    console.log('📥 Fetching all members from Supabase...');
    
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching members:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return { success: false, error, members: [] };
    }

    console.log('✅ Successfully fetched members:', data?.length || 0);
    console.log('📋 Members list:', data);
    
    return { success: true, members: data || [], error: null };
  } catch (err) {
    console.error('❌ Exception fetching members:', err);
    return { success: false, error: err, members: [] };
  }
}

/**
 * Test connection and operations
 * Adds a test member, then fetches all members
 */
export async function testConnection() {
  console.log('🧪 Testing Supabase connection...');
  
  // Step 1: Add test member
  const addResult = await addMember();
  
  if (!addResult.success) {
    console.error('❌ Failed to add test member');
    return { success: false, message: 'Failed to add test member', error: addResult.error };
  }
  
  // Step 2: Fetch all members
  const fetchResult = await fetchAllMembers();
  
  if (!fetchResult.success) {
    console.error('❌ Failed to fetch members');
    return { success: false, message: 'Failed to fetch members', error: fetchResult.error };
  }
  
  const successMessage = 'Test member added and connection verified.';
  console.log('✅', successMessage);
  
  return { 
    success: true, 
    message: successMessage,
    members: fetchResult.members 
  };
}

// Export success message constant
export const SUCCESS_MESSAGE = 'Test member added and connection verified.';

