'use client';

import { useState } from 'react';
import { addMember, fetchAllMembers, testConnection } from '@/lib/supabase-example';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function TestConnectionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAddMember = async () => {
    setLoading(true);
    setResult(null);
    
    const result = await addMember();
    setResult(result);
    setLoading(false);
  };

  const handleFetchMembers = async () => {
    setLoading(true);
    setResult(null);
    
    const result = await fetchAllMembers();
    setResult(result);
    setLoading(false);
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setResult(null);
    
    const result = await testConnection();
    setResult(result);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Supabase Connection Test</h1>
        <p className="text-slate-600">Test Supabase connection and operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={handleAddMember} 
          disabled={loading}
          variant="outline"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Add Test Member
        </Button>
        
        <Button 
          onClick={handleFetchMembers} 
          disabled={loading}
          variant="outline"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Fetch All Members
        </Button>
        
        <Button 
          onClick={handleTestConnection} 
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Test Full Connection
        </Button>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.success ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-semibold text-green-800 mb-2">
                  ✅ {result.message || 'Operation successful!'}
                </p>
                {result.members && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Members ({result.members.length}):</p>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-96">
                      {JSON.stringify(result.members, null, 2)}
                    </pre>
                  </div>
                )}
                {result.data && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Added Member:</p>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-semibold text-red-800 mb-2">
                  ❌ {result.message || 'Operation failed'}
                </p>
                {result.error && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Error Details:</p>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                      {JSON.stringify(result.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Test Full Connection" to add a test member and fetch all members</li>
            <li>Check browser console (F12) for detailed logs</li>
            <li>Verify the result shows success message</li>
            <li>Check Supabase dashboard to see the data</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}



