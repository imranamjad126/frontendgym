'use client';

import { useState } from 'react';
import { supabase } from '@/lib/auth/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ADMIN_EMAIL = 'fitnesswithimran1@gmail.com';
const ADMIN_PASSWORD = 'Aa543543@';

interface CheckResult {
  step: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
  fix?: string;
}

export default function CompleteAutoFixPage() {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const runCompleteCheck = async () => {
    setLoading(true);
    setResults([]);
    setSummary(null);
    const checks: CheckResult[] = [];

    try {
      // 1. Check Environment Variables (Client-side check)
      const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      checks.push({
        step: '1. Environment Variables',
        status: hasUrl && hasKey ? 'pass' : 'fail',
        message: hasUrl && hasKey 
          ? '✅ Environment variables are loaded'
          : '❌ Environment variables missing',
        details: hasUrl && hasKey 
          ? `URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...`
          : 'Set in Vercel Dashboard → Settings → Environment Variables',
        fix: !hasUrl || !hasKey ? 'Add variables in Vercel Dashboard' : undefined
      });

      // 2. Test Supabase Connection
      try {
        const { error } = await supabase.from('gyms').select('id').limit(1);
        if (error) {
          if (error.message.includes('relation') || error.message.includes('does not exist')) {
            checks.push({
              step: '2. Supabase Connection',
              status: 'fail',
              message: '❌ Tables not created',
              details: error.message,
              fix: 'Run supabase/04-UPGRADE_TO_MULTI_USER.sql in Supabase SQL Editor'
            });
          } else {
            checks.push({
              step: '2. Supabase Connection',
              status: 'fail',
              message: `❌ Connection error`,
              details: error.message,
              fix: 'Check Supabase URL and anon key'
            });
          }
        } else {
          checks.push({
            step: '2. Supabase Connection',
            status: 'pass',
            message: '✅ Supabase connection successful'
          });
        }
      } catch (err: any) {
        checks.push({
          step: '2. Supabase Connection',
          status: 'fail',
          message: `❌ Connection failed`,
          details: err.message
        });
      }

      // 3. Test Auth Connection
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            checks.push({
              step: '3. Auth Connection',
              status: 'fail',
              message: '❌ Admin user does not exist in Supabase Auth',
              details: error.message,
              fix: 'Create admin user in Supabase Dashboard → Authentication → Users'
            });
          } else {
            checks.push({
              step: '3. Auth Connection',
              status: 'fail',
              message: `❌ Auth error`,
              details: error.message
            });
          }
        } else {
          checks.push({
            step: '3. Auth Connection',
            status: 'pass',
            message: '✅ Auth connection and login successful'
          });
          // Sign out after test
          await supabase.auth.signOut();
        }
      } catch (err: any) {
        checks.push({
          step: '3. Auth Connection',
          status: 'fail',
          message: `❌ Auth test failed`,
          details: err.message
        });
      }

      // 4. Check Users Table
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, role, gym_id')
          .eq('email', ADMIN_EMAIL)
          .single();

        if (error) {
          if (error.message.includes('relation') || error.message.includes('does not exist')) {
            checks.push({
              step: '4. Users Table',
              status: 'fail',
              message: '❌ Users table does not exist',
              details: error.message,
              fix: 'Run supabase/04-UPGRADE_TO_MULTI_USER.sql to create tables'
            });
          } else {
            checks.push({
              step: '4. Users Table',
              status: 'fail',
              message: '❌ Admin user not in users table',
              details: error.message,
              fix: `Run: INSERT INTO users (id, email, role, gym_id) VALUES ((SELECT id FROM auth.users WHERE email = '${ADMIN_EMAIL}'), '${ADMIN_EMAIL}', 'ADMIN', NULL) ON CONFLICT (id) DO UPDATE SET role = 'ADMIN', gym_id = NULL;`
            });
          }
        } else if (!data) {
          checks.push({
            step: '4. Users Table',
            status: 'fail',
            message: '❌ Admin user record missing',
            fix: `Run: INSERT INTO users (id, email, role, gym_id) VALUES ((SELECT id FROM auth.users WHERE email = '${ADMIN_EMAIL}'), '${ADMIN_EMAIL}', 'ADMIN', NULL) ON CONFLICT (id) DO UPDATE SET role = 'ADMIN', gym_id = NULL;`
          });
        } else {
          checks.push({
            step: '4. Users Table',
            status: 'pass',
            message: `✅ Users table OK`,
            details: `Role: ${data.role}, Gym ID: ${data.gym_id || 'NULL'}`
          });
        }
      } catch (err: any) {
        checks.push({
          step: '4. Users Table',
          status: 'fail',
          message: `❌ Check failed`,
          details: err.message
        });
      }

      // 5. Check Schema
      try {
        const tables = ['gyms', 'users', 'members', 'attendance', 'payments'];
        const missing: string[] = [];

        for (const table of tables) {
          const { error } = await supabase.from(table).select('id').limit(1);
          if (error && (error.message.includes('relation') || error.message.includes('does not exist'))) {
            missing.push(table);
          }
        }

        if (missing.length > 0) {
          checks.push({
            step: '5. Schema Validation',
            status: 'fail',
            message: `❌ Missing tables: ${missing.join(', ')}`,
            fix: 'Run supabase/04-UPGRADE_TO_MULTI_USER.sql to create all tables'
          });
        } else {
          // Check gym_id in members
          const { error: membersError } = await supabase
            .from('members')
            .select('gym_id')
            .limit(1);

          if (membersError && membersError.message.includes('column')) {
            checks.push({
              step: '5. Schema Validation',
              status: 'fail',
              message: '❌ Members table missing gym_id column',
              fix: 'Run migration to add gym_id to all tables'
            });
          } else {
            checks.push({
              step: '5. Schema Validation',
              status: 'pass',
              message: '✅ All tables exist with correct schema'
            });
          }
        }
      } catch (err: any) {
        checks.push({
          step: '5. Schema Validation',
          status: 'fail',
          message: `❌ Schema check failed`,
          details: err.message
        });
      }

      // 6. Test Production URL
      try {
        const response = await fetch('https://mynew-frontendgym.vercel.app/login', {
          method: 'HEAD',
          mode: 'no-cors'
        });
        checks.push({
          step: '6. Production URL',
          status: 'pass',
          message: '✅ Production URL is accessible',
          details: 'https://mynew-frontendgym.vercel.app'
        });
      } catch (err: any) {
        checks.push({
          step: '6. Production URL',
          status: 'warning',
          message: '⚠️ Could not verify production URL',
          details: 'Check manually: https://mynew-frontendgym.vercel.app'
        });
      }

      // Generate Summary
      const passed = checks.filter(c => c.status === 'pass').length;
      const failed = checks.filter(c => c.status === 'fail').length;
      const warnings = checks.filter(c => c.status === 'warning').length;
      const total = checks.length;

      setSummary({
        total,
        passed,
        failed,
        warnings,
        shouldWork: failed === 0,
        fixes: checks.filter(c => c.fix).map(c => ({
          step: c.step,
          fix: c.fix
        }))
      });

    } catch (error: any) {
      checks.push({
        step: 'Error',
        status: 'fail',
        message: `Diagnostic failed: ${error.message}`
      });
    }

    setResults(checks);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">🔧 Complete Auto-Fix Diagnostic</CardTitle>
            <p className="text-slate-600">Comprehensive check of all systems</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runCompleteCheck} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Running Complete Diagnostics...' : '🚀 Run Complete Diagnostic'}
            </Button>

            {results.length > 0 && (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded border ${
                      result.status === 'pass'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : result.status === 'warning'
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    <div className="font-semibold mb-1">{result.step}</div>
                    <div className="text-sm mb-2">{result.message}</div>
                    {result.details && (
                      <div className="text-xs opacity-80 mb-2">{result.details}</div>
                    )}
                    {result.fix && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold mb-1">Fix:</div>
                        <pre className="text-xs bg-white p-2 rounded overflow-auto">
                          {result.fix}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {summary && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>📊 Complete Diagnostic Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{summary.total}</div>
                      <div className="text-sm text-slate-600">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
                      <div className="text-sm text-slate-600">Passed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                      <div className="text-sm text-slate-600">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
                      <div className="text-sm text-slate-600">Warnings</div>
                    </div>
                  </div>

                  <div className={`p-4 rounded ${
                    summary.shouldWork 
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    <div className="font-semibold mb-2">
                      {summary.shouldWork 
                        ? '✅ All Systems Operational - Login Should Work!' 
                        : '❌ Issues Found - Fix Required Before Login Will Work'}
                    </div>
                    {!summary.shouldWork && summary.fixes.length > 0 && (
                      <div className="text-sm">
                        <div className="font-semibold mb-2">Required Fixes:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {summary.fixes.map((fix: any, index: number) => (
                            <li key={index} className="text-xs">{fix.step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 space-y-2 pt-4 border-t">
                    <p><strong>Next Steps:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      {summary.shouldWork ? (
                        <>
                          <li>Test login: <a href="/login" className="text-blue-600 hover:underline">/login</a></li>
                          <li>Access admin dashboard: <a href="/admin" className="text-blue-600 hover:underline">/admin</a></li>
                        </>
                      ) : (
                        <>
                          <li>Fix all red ❌ errors above</li>
                          <li>Run diagnostic again</li>
                          <li>Test login once all checks pass</li>
                        </>
                      )}
                    </ol>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

