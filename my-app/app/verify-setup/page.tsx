'use client';

import { useState } from 'react';
import { supabase } from '@/lib/auth/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VerifySetupPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const checkSetup = async () => {
    setLoading(true);
    setResults([]);
    const checks: any[] = [];

    try {
      // Check 1: Tables exist
      const { data: tables, error: tablesError } = await supabase
        .from('gyms')
        .select('id')
        .limit(1);

      checks.push({
        name: '📋 Tables Check',
        status: !tablesError ? '✅ All tables exist' : '❌ Tables missing - Run upgrade SQL',
        details: tablesError ? tablesError.message : 'gyms, users, members, attendance, payments tables found',
      });

      // Check 2: Users table exists and has records
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'fitnesswithimran1@gmail.com')
        .single();

      checks.push({
        name: '📋 Users Table Record',
        status: users && !usersError 
          ? `✅ Admin user found (Role: ${users.role})` 
          : '❌ Admin user NOT in users table - Run STEP 2 SQL',
        details: usersError ? usersError.message : users ? `Role: ${users.role}, Gym ID: ${users.gym_id || 'NULL'}` : 'No record found',
      });

      // Check 3: Try to get auth user (indirect check)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        checks.push({
          name: '📋 Auth User',
          status: '✅ You are logged in',
          details: `User ID: ${authUser.id}, Email: ${authUser.email}`,
        });
      } else {
        // Try to check if we can query users table for admin
        const { data: adminUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', 'fitnesswithimran1@gmail.com')
          .single();

        checks.push({
          name: '📋 Auth User Check',
          status: adminUser 
            ? '⚠️ User exists in database but not logged in' 
            : '❌ Admin user not found - Create in Supabase Dashboard',
          details: adminUser 
            ? 'Go to Supabase Dashboard → Authentication → Users → Create user' 
            : 'User needs to be created in Supabase Auth first',
        });
      }

      // Check 4: Test login
      const testLogin = async () => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: 'fitnesswithimran1@gmail.com',
            password: 'Aa543543@',
          });

          if (error) {
            checks.push({
              name: '📋 Login Test',
              status: '❌ Login failed',
              details: error.message,
              fix: error.message.includes('Invalid') 
                ? 'User not in Supabase Auth OR email not confirmed OR password wrong'
                : error.message,
            });
          } else {
            checks.push({
              name: '📋 Login Test',
              status: '✅ Login successful!',
              details: 'You can now login',
            });
            // Sign out after test
            await supabase.auth.signOut();
          }
        } catch (err: any) {
          checks.push({
            name: '📋 Login Test',
            status: '❌ Login test error',
            details: err.message,
          });
        }
      };

      await testLogin();

    } catch (error: any) {
      checks.push({
        name: '❌ Error',
        status: 'Setup check failed',
        details: error.message,
      });
    }

    setResults(checks);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Setup Verification</CardTitle>
          <p className="text-center text-slate-600 mt-2 text-sm">
            Check karein ke sab kuch sahi se setup hai ya nahi
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={checkSetup} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Checking...' : '🔍 Check Setup'}
          </Button>

          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded border ${
                    result.status.includes('✅')
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : result.status.includes('⚠️')
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="font-semibold mb-1">{result.name}</div>
                  <div className="text-sm mb-1">{result.status}</div>
                  {result.details && (
                    <div className="text-xs opacity-80">{result.details}</div>
                  )}
                  {result.fix && (
                    <div className="text-xs mt-2 font-semibold">Fix: {result.fix}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-slate-500 space-y-2 pt-4 border-t">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>"Check Setup" button click karein</li>
              <li>Red ❌ errors ko fix karein</li>
              <li>Green ✅ sab kuch sahi hai</li>
              <li>Yellow ⚠️ warnings check karein</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


