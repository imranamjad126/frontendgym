'use client';

import { useState } from 'react';
import { supabase } from '@/lib/auth/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TestAuthPage() {
  const [email, setEmail] = useState('fitnesswithimran1@gmail.com');
  const [password, setPassword] = useState('Aa543543@');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAuthUser = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Check if user exists in auth.users
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('*')
        .eq('email', email);

      if (authError) {
        // Can't directly query auth.users, try alternative
        const { data: { user } } = await supabase.auth.getUser();
        setResult({
          type: 'info',
          message: 'Cannot directly query auth.users. Trying sign in...',
        });
      } else {
        setResult({
          type: 'success',
          message: `Found ${authUsers?.length || 0} user(s) in auth.users`,
          data: authUsers,
        });
      }
    } catch (error: any) {
      setResult({
        type: 'error',
        message: error.message,
      });
    }
    setLoading(false);
  };

  const checkUsersTable = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);

      if (error) {
        setResult({
          type: 'error',
          message: `Error: ${error.message}`,
        });
      } else {
        setResult({
          type: data && data.length > 0 ? 'success' : 'warning',
          message: data && data.length > 0 
            ? `✅ User found in users table: ${JSON.stringify(data[0], null, 2)}`
            : '❌ User NOT found in users table',
          data,
        });
      }
    } catch (error: any) {
      setResult({
        type: 'error',
        message: error.message,
      });
    }
    setLoading(false);
  };

  const testSignIn = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setResult({
          type: 'error',
          message: `❌ Sign in failed: ${error.message}`,
          error: error,
        });
      } else {
        setResult({
          type: 'success',
          message: '✅ Sign in successful!',
          data: {
            userId: data.user?.id,
            email: data.user?.email,
            emailConfirmed: data.user?.email_confirmed_at ? 'Yes' : 'No',
          },
        });
      }
    } catch (error: any) {
      setResult({
        type: 'error',
        message: `Exception: ${error.message}`,
      });
    }
    setLoading(false);
  };

  const testSignUp = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setResult({
            type: 'warning',
            message: '⚠️ User already exists. Try signing in instead.',
            error: error.message,
          });
        } else {
          setResult({
            type: 'error',
            message: `❌ Sign up failed: ${error.message}`,
            error: error,
          });
        }
      } else {
        setResult({
          type: 'success',
          message: '✅ User created! Check email for confirmation link, OR confirm in Supabase Dashboard.',
          data: {
            userId: data.user?.id,
            email: data.user?.email,
            needsConfirmation: !data.user?.email_confirmed_at,
          },
        });
      }
    } catch (error: any) {
      setResult({
        type: 'error',
        message: `Exception: ${error.message}`,
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Auth Diagnostic Tool</CardTitle>
          <p className="text-center text-slate-600 mt-2 text-sm">
            Test and diagnose authentication issues
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={testSignIn} disabled={loading} variant="default">
              Test Sign In
            </Button>
            <Button onClick={testSignUp} disabled={loading} variant="outline">
              Test Sign Up
            </Button>
            <Button onClick={checkUsersTable} disabled={loading} variant="outline">
              Check Users Table
            </Button>
            <Button onClick={checkAuthUser} disabled={loading} variant="outline">
              Check Auth User
            </Button>
          </div>

          {result && (
            <div className={`p-4 rounded ${
              result.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
              result.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
              result.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
              'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              <div className="font-semibold mb-2">{result.message}</div>
              {result.data && (
                <pre className="text-xs mt-2 overflow-auto bg-white p-2 rounded">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
              {result.error && (
                <pre className="text-xs mt-2 overflow-auto bg-white p-2 rounded">
                  {JSON.stringify(result.error, null, 2)}
                </pre>
              )}
            </div>
          )}

          <div className="text-xs text-slate-500 space-y-2 pt-4 border-t">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Click "Test Sign Up" to create user (if not exists)</li>
              <li>Go to Supabase Dashboard → Auth → Users → Confirm email</li>
              <li>Click "Check Users Table" to verify database record</li>
              <li>Click "Test Sign In" to test login</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



