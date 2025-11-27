import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'fitnesswithimran1@gmail.com';
const ADMIN_PASSWORD = 'Aa543543@';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase environment variables not configured' },
        { status: 500 }
      );
    }

    // Create admin client (with service role if available, otherwise anon)
    const adminClient = supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        })
      : createClient(supabaseUrl, supabaseAnonKey);

    const results: any = {
      steps: [],
      success: false,
      userId: null,
    };

    // Step 1: Check if user exists in auth.users
    let authUser = null;
    if (supabaseServiceKey) {
      // Use admin API to check
      const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
      if (!listError && users) {
        authUser = users.users.find((u: any) => u.email === ADMIN_EMAIL);
        results.steps.push({
          step: 'Check existing user',
          status: authUser ? 'found' : 'not_found',
          message: authUser ? 'User exists in Supabase Auth' : 'User does not exist',
        });
      }
    } else {
      // Try to sign in to check if user exists
      const { data: signInData, error: signInError } = await adminClient.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

      if (!signInError && signInData?.user) {
        authUser = signInData.user;
        results.steps.push({
          step: 'Check existing user',
          status: 'found',
          message: 'User exists in Supabase Auth',
        });
        // Sign out after check
        await adminClient.auth.signOut();
      } else {
        results.steps.push({
          step: 'Check existing user',
          status: 'not_found',
          message: 'User does not exist in Supabase Auth',
        });
      }
    }

    // Step 2: Create user if doesn't exist
    if (!authUser) {
      if (supabaseServiceKey) {
        // Use admin API to create user
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            role: 'ADMIN',
          },
        });

        if (createError) {
          results.steps.push({
            step: 'Create auth user',
            status: 'error',
            message: `Failed to create user: ${createError.message}`,
          });
          return NextResponse.json(results, { status: 500 });
        }

        authUser = newUser.user;
        results.steps.push({
          step: 'Create auth user',
          status: 'success',
          message: 'User created in Supabase Auth with email confirmed',
        });
      } else {
        // Use signUp (requires email confirmation)
        const { data: signUpData, error: signUpError } = await adminClient.auth.signUp({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          options: {
            emailRedirectTo: `${request.nextUrl.origin}/login`,
          },
        });

        if (signUpError) {
          results.steps.push({
            step: 'Create auth user',
            status: 'error',
            message: `Failed to create user: ${signUpError.message}`,
            fix: 'Please create user manually in Supabase Dashboard → Authentication → Users → Add User',
          });
          return NextResponse.json(results, { status: 500 });
        }

        if (!signUpData.user) {
          results.steps.push({
            step: 'Create auth user',
            status: 'error',
            message: 'User creation failed - no user returned',
            fix: 'Please create user manually in Supabase Dashboard',
          });
          return NextResponse.json(results, { status: 500 });
        }

        authUser = signUpData.user;
        results.steps.push({
          step: 'Create auth user',
          status: 'warning',
          message: 'User created but email confirmation required',
          fix: 'Go to Supabase Dashboard → Authentication → Users → Find user → Set "Email Confirmed" = TRUE',
        });
      }
    }

    results.userId = authUser.id;

    // Step 3: Create/Update user in users table
    const { data: userData, error: userError } = await adminClient
      .from('users')
      .upsert(
        {
          id: authUser.id,
          email: ADMIN_EMAIL,
          role: 'OWNER',
          gym_id: null,
        },
        {
          onConflict: 'id',
        }
      )
      .select()
      .single();

    if (userError) {
      results.steps.push({
        step: 'Create user record',
        status: 'error',
        message: `Failed to create user record: ${userError.message}`,
        fix: 'Run SQL: INSERT INTO users (id, email, role) VALUES (auth_user_id, email, \'ADMIN\')',
      });
      return NextResponse.json(results, { status: 500 });
    }

    results.steps.push({
      step: 'Create user record',
      status: 'success',
      message: 'User record created/updated in users table',
    });

    results.success = true;
    results.message = 'Admin user setup completed successfully!';

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Failed to create admin user',
        steps: [],
        success: false,
      },
      { status: 500 }
    );
  }
}

