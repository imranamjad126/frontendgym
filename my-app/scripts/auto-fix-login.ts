/**
 * AUTO-FIX LOGIN PROBLEM
 * This script automatically diagnoses and fixes login issues
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zoddbringdphqyrkwpfe.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZGRicmluZ2RwaHF5cmt3cGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTQ3MDAsImV4cCI6MjA3OTYzMDcwMH0.U3W-u_poRkgS90r7_OUZYnFoFlwxpLDCkrChhn32nvg';

const ADMIN_EMAIL = 'fitnesswithimran1@gmail.com';
const ADMIN_PASSWORD = 'Aa543543@';

interface DiagnosticResult {
  step: string;
  status: 'pass' | 'fail' | 'fixed';
  message: string;
  fix?: string;
}

const results: DiagnosticResult[] = [];

async function checkEnvironmentVariables(): Promise<DiagnosticResult> {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!hasUrl || !hasKey) {
    return {
      step: '1. Environment Variables',
      status: 'fail',
      message: 'Missing environment variables',
      fix: JSON.stringify({
        NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY
      }, null, 2)
    };
  }

  return {
    step: '1. Environment Variables',
    status: 'pass',
    message: 'Environment variables are set'
  };
}

async function testSupabaseConnection(): Promise<DiagnosticResult> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test connection by querying a table
    const { error } = await supabase.from('gyms').select('id').limit(1);
    
    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          step: '2. Supabase Connection',
          status: 'fail',
          message: 'Tables not created - Run migration SQL',
          fix: 'Run supabase/04-UPGRADE_TO_MULTI_USER.sql in Supabase SQL Editor'
        };
      }
      
      return {
        step: '2. Supabase Connection',
        status: 'fail',
        message: `Connection error: ${error.message}`,
        fix: 'Check Supabase URL and anon key'
      };
    }

    return {
      step: '2. Supabase Connection',
      status: 'pass',
      message: 'Supabase connection successful'
    };
  } catch (error: any) {
    return {
      step: '2. Supabase Connection',
      status: 'fail',
      message: `Connection failed: ${error.message}`,
      fix: 'Verify Supabase credentials'
    };
  }
}

async function testAuthConnection(): Promise<DiagnosticResult> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return {
          step: '3. Auth Connection',
          status: 'fail',
          message: 'Admin user does not exist in Supabase Auth',
          fix: 'Create admin user in Supabase Dashboard → Authentication → Users'
        };
      }
      
      return {
        step: '3. Auth Connection',
        status: 'fail',
        message: `Auth error: ${error.message}`,
        fix: 'Check auth configuration'
      };
    }

    return {
      step: '3. Auth Connection',
      status: 'pass',
      message: 'Auth connection and login successful'
    };
  } catch (error: any) {
    return {
      step: '3. Auth Connection',
      status: 'fail',
      message: `Auth test failed: ${error.message}`
    };
  }
}

async function checkUsersTable(): Promise<DiagnosticResult> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, gym_id')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          step: '4. Users Table',
          status: 'fail',
          message: 'Users table does not exist',
          fix: 'Run supabase/04-UPGRADE_TO_MULTI_USER.sql to create tables'
        };
      }
      
      return {
        step: '4. Users Table',
        status: 'fail',
        message: 'Admin user not in users table',
        fix: `INSERT INTO users (id, email, role, gym_id) VALUES ((SELECT id FROM auth.users WHERE email = '${ADMIN_EMAIL}'), '${ADMIN_EMAIL}', 'ADMIN', NULL) ON CONFLICT (id) DO UPDATE SET role = 'ADMIN', gym_id = NULL;`
      };
    }

    if (!data) {
      return {
        step: '4. Users Table',
        status: 'fail',
        message: 'Admin user record missing',
        fix: `INSERT INTO users (id, email, role, gym_id) VALUES ((SELECT id FROM auth.users WHERE email = '${ADMIN_EMAIL}'), '${ADMIN_EMAIL}', 'ADMIN', NULL) ON CONFLICT (id) DO UPDATE SET role = 'ADMIN', gym_id = NULL;`
      };
    }

    return {
      step: '4. Users Table',
      status: 'pass',
      message: `Users table OK - Role: ${data.role}, Gym ID: ${data.gym_id || 'NULL'}`
    };
  } catch (error: any) {
    return {
      step: '4. Users Table',
      status: 'fail',
      message: `Check failed: ${error.message}`
    };
  }
}

async function checkSchema(): Promise<DiagnosticResult> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const tables = ['gyms', 'users', 'members', 'attendance', 'payments'];
    const missing: string[] = [];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error && (error.message.includes('relation') || error.message.includes('does not exist'))) {
        missing.push(table);
      }
    }

    if (missing.length > 0) {
      return {
        step: '5. Schema Validation',
        status: 'fail',
        message: `Missing tables: ${missing.join(', ')}`,
        fix: 'Run supabase/04-UPGRADE_TO_MULTI_USER.sql to create all tables'
      };
    }

    // Check gym_id columns
    const { error: membersError } = await supabase
      .from('members')
      .select('gym_id')
      .limit(1);

    if (membersError) {
      return {
        step: '5. Schema Validation',
        status: 'fail',
        message: 'Members table missing gym_id column',
        fix: 'Run migration to add gym_id to all tables'
      };
    }

    return {
      step: '5. Schema Validation',
      status: 'pass',
      message: 'All tables exist with correct schema'
    };
  } catch (error: any) {
    return {
      step: '5. Schema Validation',
      status: 'fail',
      message: `Schema check failed: ${error.message}`
    };
  }
}

export async function runDiagnostics(): Promise<DiagnosticResult[]> {
  results.push(await checkEnvironmentVariables());
  results.push(await testSupabaseConnection());
  results.push(await testAuthConnection());
  results.push(await checkUsersTable());
  results.push(await checkSchema());
  
  return results;
}

