'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export function ErrorDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);

  const runDiagnostics = async () => {
    setRunning(true);
    setDiagnostics([]);
    const results: DiagnosticResult[] = [];

    // Test 1: Check Supabase client initialization
    try {
      if (!supabase) {
        results.push({
          test: 'Supabase Client',
          status: 'error',
          message: 'Supabase client is not initialized',
        });
      } else {
        results.push({
          test: 'Supabase Client',
          status: 'success',
          message: 'Supabase client initialized correctly',
        });
      }
    } catch (err) {
      results.push({
        test: 'Supabase Client',
        status: 'error',
        message: `Failed to initialize: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }

    // Test 2: Check connection to Supabase
    try {
      const { data, error } = await supabase.from('members').select('count').limit(0);
      
      if (error) {
        results.push({
          test: 'Database Connection',
          status: 'error',
          message: `Connection failed: ${error.message || error.code || JSON.stringify(error)}`,
          details: {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          },
        });
      } else {
        results.push({
          test: 'Database Connection',
          status: 'success',
          message: 'Successfully connected to Supabase',
        });
      }
    } catch (err) {
      results.push({
        test: 'Database Connection',
        status: 'error',
        message: `Exception: ${err instanceof Error ? err.message : 'Unknown error'}`,
        details: err,
      });
    }

    // Test 3: Check if table exists
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .limit(1);

      if (error) {
        const errorCode = error.code || '';
        const isTableMissing = 
          errorCode === '42P01' || 
          errorCode === 'PGRST116' ||
          error.message?.toLowerCase().includes('does not exist') ||
          error.message?.toLowerCase().includes('relation') ||
          error.hint?.toLowerCase().includes('table');

        if (isTableMissing) {
          results.push({
            test: 'Table Exists',
            status: 'error',
            message: '❌ Table "members" does NOT exist in Supabase',
            details: {
              solution: 'Run the SQL script from supabase-setup.sql in Supabase SQL Editor',
              error: {
                code: error.code,
                message: error.message,
                hint: error.hint,
              },
            },
          });
        } else {
          results.push({
            test: 'Table Exists',
            status: 'error',
            message: `Table access error: ${error.message || error.code}`,
            details: {
              code: error.code,
              message: error.message,
              hint: error.hint,
            },
          });
        }
      } else {
        results.push({
          test: 'Table Exists',
          status: 'success',
          message: '✅ Table "members" exists and is accessible',
          details: {
            rowCount: data?.length || 0,
          },
        });
      }
    } catch (err) {
      results.push({
        test: 'Table Exists',
        status: 'error',
        message: `Exception checking table: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }

    // Test 4: Check RLS policies
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id')
        .limit(1);

      if (error) {
        const isRLSError = 
          error.code === '42501' ||
          error.code === 'PGRST301' ||
          error.message?.toLowerCase().includes('permission') ||
          error.message?.toLowerCase().includes('policy');

        if (isRLSError) {
          results.push({
            test: 'Row Level Security',
            status: 'error',
            message: '❌ RLS policy blocking access',
            details: {
              solution: 'Create a policy: CREATE POLICY "Allow all operations for anon users" ON members FOR ALL TO anon USING (true) WITH CHECK (true);',
              error: {
                code: error.code,
                message: error.message,
              },
            },
          });
        }
      } else {
        results.push({
          test: 'Row Level Security',
          status: 'success',
          message: '✅ RLS policies allow access',
        });
      }
    } catch (err) {
      // Ignore for now
    }

    setDiagnostics(results);
    setRunning(false);
  };

  useEffect(() => {
    // Auto-run on mount
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Supabase Error Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostics} disabled={running}>
          {running ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </Button>

        {diagnostics.length > 0 && (
          <div className="space-y-3">
            {diagnostics.map((diag, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(diag.status)}`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(diag.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{diag.test}</h3>
                    <p className="text-sm">{diag.message}</p>
                    {diag.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium">
                          View Details
                        </summary>
                        <div className="mt-2">
                          {diag.details.solution && (
                            <div className="mb-2 p-2 bg-white rounded border">
                              <p className="font-semibold text-sm mb-1">💡 Solution:</p>
                              <p className="text-xs">{diag.details.solution}</p>
                            </div>
                          )}
                          <pre className="text-xs overflow-auto bg-white p-2 rounded border">
                            {JSON.stringify(diag.details, null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {diagnostics.some(d => d.status === 'error') && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-semibold text-blue-800 mb-2">📋 Quick Fix Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li>Go to Supabase Dashboard → SQL Editor</li>
              <li>Open file: <code className="bg-blue-100 px-1 rounded">supabase-setup.sql</code></li>
              <li>Copy the entire SQL script</li>
              <li>Paste and Run in SQL Editor</li>
              <li>Click "Run Diagnostics" again to verify</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



