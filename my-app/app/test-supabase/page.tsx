'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestSupabasePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDirect = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 Starting direct Supabase test...');
      console.log('Supabase client:', supabase);
      console.log('Supabase URL:', supabase.supabaseUrl);
      
      // Test 1: Simple query
      console.log('Test 1: Simple select query...');
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .limit(1);

      console.log('Query result:', { data, error });
      console.log('Error type:', typeof error);
      console.log('Error is null?', error === null);
      console.log('Error is undefined?', error === undefined);
      
      if (error) {
        console.log('Error exists!');
        console.log('Error object:', error);
        console.log('Error keys:', Object.keys(error));
        console.log('Error properties:', Object.getOwnPropertyNames(error));
        console.log('Error.message:', (error as any)?.message);
        console.log('Error.code:', (error as any)?.code);
        console.log('Error.details:', (error as any)?.details);
        console.log('Error.hint:', (error as any)?.hint);
        
        // Try to stringify
        try {
          const errorStr = JSON.stringify(error, null, 2);
          console.log('Error JSON:', errorStr);
        } catch (e) {
          console.log('Cannot stringify error:', e);
        }
      }

      setResult({
        success: !error,
        data,
        error: error ? {
          message: (error as any)?.message,
          code: (error as any)?.code,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
          fullError: error,
          errorType: typeof error,
          errorKeys: Object.keys(error || {}),
          errorProperties: Object.getOwnPropertyNames(error || {}),
        } : null,
      });
    } catch (err) {
      console.error('Exception in test:', err);
      setResult({
        success: false,
        exception: err,
        errorType: typeof err,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Supabase Direct Test</h1>
        <p className="text-slate-600">This page tests the Supabase connection directly</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testDirect} disabled={loading}>
            {loading ? 'Testing...' : 'Run Direct Test'}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <h3 className="font-semibold mb-2">
                {result.success ? '✅ Success' : '❌ Error'}
              </h3>
              
              {result.data && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-1">Data:</p>
                  <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}

              {result.error && (
                <div>
                  <p className="text-sm font-medium mb-1">Error Details:</p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Message:</strong> {result.error.message || 'N/A'}</p>
                    <p><strong>Code:</strong> {result.error.code || 'N/A'}</p>
                    <p><strong>Details:</strong> {result.error.details || 'N/A'}</p>
                    <p><strong>Hint:</strong> {result.error.hint || 'N/A'}</p>
                    <p><strong>Error Type:</strong> {result.error.errorType}</p>
                    <p><strong>Error Keys:</strong> {result.error.errorKeys?.join(', ') || 'None'}</p>
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium">Full Error Object</summary>
                      <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                        {JSON.stringify(result.error.fullError, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              )}

              {result.exception && (
                <div>
                  <p className="text-sm font-medium mb-1">Exception:</p>
                  <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(result.exception, null, 2)}
                  </pre>
                </div>
              )}

              {result.error?.code === '42P01' || result.error?.message?.includes('does not exist') ? (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="font-semibold text-yellow-800 mb-1">💡 Solution:</p>
                  <p className="text-sm text-yellow-700">
                    The table "members" does not exist. Go to Supabase Dashboard → SQL Editor → 
                    Run the script from <code className="bg-yellow-100 px-1 rounded">supabase-setup.sql</code>
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Run Direct Test" button</li>
            <li>Check browser console (F12) for detailed logs</li>
            <li>Check the result panel above</li>
            <li>If error shows table doesn't exist, create it in Supabase</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}



