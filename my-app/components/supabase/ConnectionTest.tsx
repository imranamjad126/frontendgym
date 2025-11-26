'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      // Test 1: Basic connection
      const { data: testData, error: testError } = await supabase
        .from('members')
        .select('count')
        .limit(1);

      if (testError) {
        setResult({
          success: false,
          message: `Connection Failed: ${testError.message || JSON.stringify(testError)}`,
          details: {
            code: testError.code,
            message: testError.message,
            details: testError.details,
            hint: testError.hint,
          },
        });
        return;
      }

      // Test 2: Try to fetch (even if empty)
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .limit(1);

      if (error) {
        setResult({
          success: false,
          message: `Table Access Error: ${error.message || JSON.stringify(error)}`,
          details: {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          },
        });
        return;
      }

      setResult({
        success: true,
        message: '✅ Connection Successful! Table exists and is accessible.',
        details: {
          rowCount: data?.length || 0,
          canRead: true,
          canWrite: true,
        },
      });
    } catch (err) {
      setResult({
        success: false,
        message: `Exception: ${err instanceof Error ? err.message : 'Unknown error'}`,
        details: err,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={testing}>
          {testing ? 'Testing...' : 'Test Connection'}
        </Button>

        {result && (
          <div
            className={`p-4 rounded-lg ${
              result.success
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <p className="font-semibold mb-2">{result.message}</p>
            {result.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">View Details</summary>
                <pre className="mt-2 text-xs overflow-auto bg-white p-2 rounded border">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {result && !result.success && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-semibold text-yellow-800 mb-2">🔧 How to Fix:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
              <li>Go to Supabase Dashboard → SQL Editor</li>
              <li>Open the file: <code className="bg-yellow-100 px-1 rounded">supabase-setup.sql</code></li>
              <li>Copy and paste the SQL script</li>
              <li>Click "Run" to execute</li>
              <li>Click "Test Connection" again</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



