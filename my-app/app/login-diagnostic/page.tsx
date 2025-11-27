'use client';

import { useState } from 'react';
import { supabase } from '@/lib/auth/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ADMIN_EMAIL = 'fitnesswithimran1@gmail.com';
const ADMIN_PASSWORD = 'Aa543543@';

interface DiagnosticResult {
  check: string;
  status: '✅ PASS' | '❌ FAIL' | '⚠️ WARNING';
  message: string;
  details?: string;
  fix?: string;
}

export default function LoginDiagnosticPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState(ADMIN_EMAIL);
  const [testPassword, setTestPassword] = useState(ADMIN_PASSWORD);

  const runDiagnostics = async () => {
    setLoading(true);
    setResults([]);
    const checks: DiagnosticResult[] = [];

    try {
      // ============================================
      // CHECK 1: Environment Variables
      // ============================================
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      checks.push({
        check: '1. Environment Variables',
        status: (supabaseUrl && supabaseKey) ? '✅ PASS' : '❌ FAIL',
        message: (supabaseUrl && supabaseKey) 
          ? 'Environment variables are loaded'
          : 'Environment variables are missing or empty',
        details: supabaseUrl && supabaseKey
          ? `URL: ${supabaseUrl.substring(0, 40)}...\nKey: ${supabaseKey.substring(0, 30)}...`
          : 'Check Vercel Dashboard → Settings → Environment Variables',
        fix: !supabaseUrl || !supabaseKey 
          ? 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel'
          : undefined
      });

      // ============================================
      // CHECK 2: Supabase Client Configuration
      // ============================================
      try {
        const testClient = supabase;
        if (testClient && supabaseUrl && supabaseKey) {
          checks.push({
            check: '2. Supabase Client Config',
            status: '✅ PASS',
            message: 'Supabase client is correctly configured',
            details: 'Client initialized with valid URL and key'
          });
        } else {
          checks.push({
            check: '2. Supabase Client Config',
            status: '❌ FAIL',
            message: 'Supabase client configuration is invalid',
            fix: 'Check lib/auth/client.ts - ensure env variables are loaded'
          });
        }
      } catch (err: any) {
        checks.push({
          check: '2. Supabase Client Config',
          status: '❌ FAIL',
          message: `Client initialization error: ${err.message}`,
          fix: 'Verify Supabase client setup in lib/auth/client.ts'
        });
      }

      // ============================================
      // CHECK 3: Email Input Validation
      // ============================================
      const trimmedEmail = testEmail.trim();
      const hasSpaces = testEmail !== trimmedEmail;
      const hasTypo = !trimmedEmail.includes('@') || !trimmedEmail.includes('.');
      
      checks.push({
        check: '3. Email Input Validation',
        status: (!hasSpaces && !hasTypo && trimmedEmail === ADMIN_EMAIL) ? '✅ PASS' : '⚠️ WARNING',
        message: hasSpaces 
          ? 'Email has leading/trailing spaces'
          : hasTypo
          ? 'Email format may be incorrect'
          : trimmedEmail !== ADMIN_EMAIL
          ? 'Email does not match admin email'
          : 'Email input is valid',
        details: hasSpaces 
          ? `Original: "${testEmail}" → Trimmed: "${trimmedEmail}"`
          : `Email: ${trimmedEmail}`,
        fix: hasSpaces 
          ? 'Trim email input: email.trim()'
          : trimmedEmail !== ADMIN_EMAIL
          ? `Use exact email: ${ADMIN_EMAIL}`
          : undefined
      });

      // ============================================
      // CHECK 4: Password Input Validation
      // ============================================
      const trimmedPassword = testPassword.trim();
      const passwordHasSpaces = testPassword !== trimmedPassword;
      
      checks.push({
        check: '4. Password Input Validation',
        status: (!passwordHasSpaces && trimmedPassword === ADMIN_PASSWORD) ? '✅ PASS' : '⚠️ WARNING',
        message: passwordHasSpaces
          ? 'Password has leading/trailing spaces'
          : trimmedPassword !== ADMIN_PASSWORD
          ? 'Password does not match admin password'
          : 'Password input is valid',
        details: passwordHasSpaces
          ? 'Password will be trimmed before login'
          : `Password length: ${trimmedPassword.length} characters`,
        fix: passwordHasSpaces
          ? 'Trim password input: password.trim()'
          : trimmedPassword !== ADMIN_PASSWORD
          ? `Use exact password: ${ADMIN_PASSWORD}`
          : undefined
      });

      // ============================================
      // CHECK 5: User Exists in Supabase Auth
      // ============================================
      try {
        // Try to sign in to check if user exists
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });

        if (authError) {
          if (authError.message.includes('Invalid login credentials') || authError.message.includes('Invalid credentials')) {
            checks.push({
              check: '5. User in Supabase Auth',
              status: '❌ FAIL',
              message: 'User does not exist OR credentials are incorrect',
              details: `Error: ${authError.message}`,
              fix: 'Create user in Supabase Dashboard → Authentication → Users → Add User'
            });
          } else if (authError.message.includes('Email not confirmed')) {
            checks.push({
              check: '5. User in Supabase Auth',
              status: '⚠️ WARNING',
              message: 'User exists but email is not confirmed',
              details: authError.message,
              fix: 'In Supabase Dashboard → Authentication → Users → Set "Email Confirmed" = TRUE'
            });
          } else {
            checks.push({
              check: '5. User in Supabase Auth',
              status: '❌ FAIL',
              message: `Auth error: ${authError.message}`,
              details: `Status: ${authError.status}`,
              fix: 'Check Supabase Auth settings and user status'
            });
          }
        } else if (authData?.user) {
          checks.push({
            check: '5. User in Supabase Auth',
            status: '✅ PASS',
            message: 'User exists and login successful!',
            details: `User ID: ${authData.user.id}, Email: ${authData.user.email}`
          });

          // Sign out after test
          await supabase.auth.signOut();
        }
      } catch (err: any) {
        checks.push({
          check: '5. User in Supabase Auth',
          status: '❌ FAIL',
          message: `Failed to check user: ${err.message}`,
          fix: 'Verify Supabase connection and credentials'
        });
      }

      // ============================================
      // CHECK 6: Email Confirmation Status
      // ============================================
      try {
        // This requires admin API, but we can check via auth response
        // If we got here, user exists - check if we can get user info
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          checks.push({
            check: '6. Email Confirmation',
            status: user.email_confirmed_at ? '✅ PASS' : '⚠️ WARNING',
            message: user.email_confirmed_at 
              ? 'Email is confirmed'
              : 'Email confirmation may be required',
            details: user.email_confirmed_at
              ? `Confirmed at: ${new Date(user.email_confirmed_at).toLocaleString()}`
              : 'Set "Email Confirmed" = TRUE in Supabase Dashboard',
            fix: !user.email_confirmed_at
              ? 'Supabase Dashboard → Authentication → Users → Set "Email Confirmed" = TRUE'
              : undefined
          });
        } else {
          checks.push({
            check: '6. Email Confirmation',
            status: '⚠️ WARNING',
            message: 'Cannot verify email confirmation status',
            fix: 'Manually check in Supabase Dashboard → Authentication → Users'
          });
        }
      } catch (err: any) {
        checks.push({
          check: '6. Email Confirmation',
          status: '⚠️ WARNING',
          message: 'Could not check email confirmation',
          details: err.message
        });
      }

      // ============================================
      // CHECK 7: Rate Limiting
      // ============================================
      checks.push({
        check: '7. Rate Limiting',
        status: '⚠️ WARNING',
        message: 'Rate limit status cannot be checked via API',
        details: 'If you see "Too many requests" error, wait 5-10 minutes',
        fix: 'Wait 5-10 minutes if rate limited, then try again'
      });

      // ============================================
      // CHECK 8: User in Custom Users Table
      // ============================================
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, role, gym_id')
            .eq('id', user.id)
            .single();

          if (userError || !userData) {
            checks.push({
              check: '8. User in Custom Users Table',
              status: '❌ FAIL',
              message: 'User not found in custom users table',
              details: userError?.message || 'No record found',
              fix: 'Run SQL: INSERT INTO users (id, email, role) VALUES (auth_user_id, email, \'ADMIN\')'
            });
          } else {
            checks.push({
              check: '8. User in Custom Users Table',
              status: '✅ PASS',
              message: 'User exists in custom users table',
              details: `Role: ${userData.role}, Gym ID: ${userData.gym_id || 'NULL'}`
            });
          }
        }
      } catch (err: any) {
        checks.push({
          check: '8. User in Custom Users Table',
          status: '⚠️ WARNING',
          message: 'Could not check custom users table',
          details: err.message
        });
      }

    } catch (err: any) {
      checks.push({
        check: 'Diagnostic Error',
        status: '❌ FAIL',
        message: `Failed to run diagnostics: ${err.message}`,
        details: err.stack
      });
    }

    setResults(checks);
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const trimmedEmail = testEmail.trim();
      const trimmedPassword = testPassword.trim();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) {
        alert(`❌ Login Failed:\n${error.message}`);
      } else {
        alert(`✅ Login Successful!\nUser: ${data.user?.email}`);
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">🔍 Login Diagnostic Tool</CardTitle>
            <p className="text-slate-600">Checks all 7 common login issues automatically</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Test Email</label>
                <Input
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Test Password</label>
                <Input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={runDiagnostics} disabled={loading}>
                {loading ? 'Running...' : '🔍 Run Full Diagnostics'}
              </Button>
              <Button onClick={testLogin} disabled={loading} variant="outline">
                🧪 Test Login
              </Button>
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      result.status.includes('PASS')
                        ? 'bg-green-50 border-green-200'
                        : result.status.includes('FAIL')
                        ? 'bg-red-50 border-red-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="font-semibold mb-2">{result.check}</div>
                    <div className="text-sm mb-1">
                      <strong>Status:</strong> {result.status}
                    </div>
                    <div className="text-sm mb-1">
                      <strong>Message:</strong> {result.message}
                    </div>
                    {result.details && (
                      <div className="text-sm mb-1 text-slate-600">
                        <strong>Details:</strong>
                        <pre className="mt-1 text-xs bg-white p-2 rounded overflow-auto">
                          {result.details}
                        </pre>
                      </div>
                    )}
                    {result.fix && (
                      <div className="text-sm mt-2 p-2 bg-blue-50 rounded">
                        <strong>🔧 Fix:</strong> {result.fix}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

