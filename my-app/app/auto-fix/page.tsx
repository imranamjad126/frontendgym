'use client';

import { useState } from 'react';
import { supabase } from '@/lib/auth/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ADMIN_EMAIL = 'fitnesswithimran1@gmail.com';
const ADMIN_PASSWORD = 'Aa543543@';

interface DiagnosticResult {
  step: string;
  status: 'pass' | 'fail' | 'fixed';
  message: string;
  fix?: string;
}

export default function AutoFixPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setResults([]);
    setSummary(null);
    const diagnostics: DiagnosticResult[] = [];

    try {
      // 1. Check Environment Variables
      const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      diagnostics.push({
        step: '1. Environment Variables',
        status: hasUrl && hasKey ? 'pass' : 'fail',
        message: hasUrl && hasKey 
          ? '✅ Environment variables are set'
          : '❌ Missing environment variables',
        fix: !hasUrl || !hasKey ? JSON.stringify({
          NEXT_PUBLIC_SUPABASE_URL: 'https://zoddbringdphqyrkwpfe.supabase.co',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZGRicmluZ2RwaHF5cmt3cGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTQ3MDAsImV4cCI6MjA3OTYzMDcwMH0.U3W-u_poRkgS90r7_OUZYnFoFlwxpLDCkrChhn32nvg'
        }, null, 2) : undefined
      });

      // 2. Test Supabase Connection
      try {
        const { error } = await supabase.from('gyms').select('id').limit(1);
        if (error) {
          if (error.message.includes('relation') || error.message.includes('does not exist')) {
            diagnostics.push({
              step: '2. Supabase Connection',
              status: 'fail',
              message: '❌ Tables not created',
              fix: 'Run supabase/04-UPGRADE_TO_MULTI_USER.sql in Supabase SQL Editor'
            });
          } else {
            diagnostics.push({
              step: '2. Supabase Connection',
              status: 'fail',
              message: `❌ Connection error: ${error.message}`,
              fix: 'Check Supabase URL and anon key'
            });
          }
        } else {
          diagnostics.push({
            step: '2. Supabase Connection',
            status: 'pass',
            message: '✅ Supabase connection successful'
          });
        }
      } catch (err: any) {
        diagnostics.push({
          step: '2. Supabase Connection',
          status: 'fail',
          message: `❌ Connection failed: ${err.message}`
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
            diagnostics.push({
              step: '3. Auth Connection',
              status: 'fail',
              message: '❌ Admin user does not exist in Supabase Auth',
              fix: 'Create admin user in Supabase Dashboard → Authentication → Users'
            });
          } else {
            diagnostics.push({
              step: '3. Auth Connection',
              status: 'fail',
              message: `❌ Auth error: ${error.message}`
            });
          }
        } else {
          diagnostics.push({
            step: '3. Auth Connection',
            status: 'pass',
            message: '✅ Auth connection and login successful'
          });
          // Sign out after test
          await supabase.auth.signOut();
        }
      } catch (err: any) {
        diagnostics.push({
          step: '3. Auth Connection',
          status: 'fail',
          message: `❌ Auth test failed: ${err.message}`
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
            diagnostics.push({
              step: '4. Users Table',
              status: 'fail',
              message: '❌ Users table does not exist',
              fix: 'Run supabase/04-UPGRADE_TO_MULTI_USER.sql to create tables'
            });
          } else {
            diagnostics.push({
              step: '4. Users Table',
              status: 'fail',
              message: '❌ Admin user not in users table',
              fix: `INSERT INTO users (id, email, role, gym_id) VALUES ((SELECT id FROM auth.users WHERE email = '${ADMIN_EMAIL}'), '${ADMIN_EMAIL}', 'ADMIN', NULL) ON CONFLICT (id) DO UPDATE SET role = 'ADMIN', gym_id = NULL;`
            });
          }
        } else if (!data) {
          diagnostics.push({
            step: '4. Users Table',
            status: 'fail',
            message: '❌ Admin user record missing',
            fix: `INSERT INTO users (id, email, role, gym_id) VALUES ((SELECT id FROM auth.users WHERE email = '${ADMIN_EMAIL}'), '${ADMIN_EMAIL}', 'ADMIN', NULL) ON CONFLICT (id) DO UPDATE SET role = 'ADMIN', gym_id = NULL;`
          });
        } else {
          diagnostics.push({
            step: '4. Users Table',
            status: 'pass',
            message: `✅ Users table OK - Role: ${data.role}, Gym ID: ${data.gym_id || 'NULL'}`
          });
        }
      } catch (err: any) {
        diagnostics.push({
          step: '4. Users Table',
          status: 'fail',
          message: `❌ Check failed: ${err.message}`
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
          diagnostics.push({
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
            diagnostics.push({
              step: '5. Schema Validation',
              status: 'fail',
              message: '❌ Members table missing gym_id column',
              fix: 'Run migration to add gym_id to all tables'
            });
          } else {
            diagnostics.push({
              step: '5. Schema Validation',
              status: 'pass',
              message: '✅ All tables exist with correct schema'
            });
          }
        }
      } catch (err: any) {
        diagnostics.push({
          step: '5. Schema Validation',
          status: 'fail',
          message: `❌ Schema check failed: ${err.message}`
        });
      }

      // Generate Summary
      const passed = diagnostics.filter(d => d.status === 'pass').length;
      const failed = diagnostics.filter(d => d.status === 'fail').length;
      const total = diagnostics.length;

      setSummary({
        total,
        passed,
        failed,
        shouldWork: failed === 0,
        fixes: diagnostics.filter(d => d.fix).map(d => ({
          step: d.step,
          fix: d.fix
        }))
      });

    } catch (error: any) {
      diagnostics.push({
        step: 'Error',
        status: 'fail',
        message: `Diagnostic failed: ${error.message}`
      });
    }

    setResults(diagnostics);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">🔧 Auto-Fix Login Problem</CardTitle>
            <p className="text-slate-600">Automatically diagnose and fix all login issues</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runDiagnostics} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Running Diagnostics...' : '🔍 Run Complete Diagnostics'}
            </Button>

            {results.length > 0 && (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded border ${
                      result.status === 'pass'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    <div className="font-semibold mb-1">{result.step}</div>
                    <div className="text-sm mb-2">{result.message}</div>
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
                  <CardTitle>📊 Diagnostic Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{summary.total}</div>
                      <div className="text-sm text-slate-600">Total Checks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
                      <div className="text-sm text-slate-600">Passed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                      <div className="text-sm text-slate-600">Failed</div>
                    </div>
                  </div>

                  <div className={`p-4 rounded ${
                    summary.shouldWork 
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    <div className="font-semibold mb-2">
                      {summary.shouldWork 
                        ? '✅ Login Should Work Now!' 
                        : '❌ Login Will Not Work - Fix Issues Above'}
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
                </CardContent>
              </Card>
            )}

            <div className="text-xs text-slate-500 space-y-2 pt-4 border-t">
              <p><strong>Quick Links:</strong></p>
              <div className="flex gap-2 flex-wrap">
                <a href="/login" className="text-blue-600 hover:underline">Login Page</a>
                <span>•</span>
                <a href="/setup-admin" className="text-blue-600 hover:underline">Setup Admin</a>
                <span>•</span>
                <a href="/test-auth" className="text-blue-600 hover:underline">Test Auth</a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

