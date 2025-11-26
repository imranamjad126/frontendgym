'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-new/client';
import { getAllMembers, addMember } from '@/lib/supabase-new/members';
import { recordAttendance } from '@/lib/supabase-new/attendance';
import { recordPayment } from '@/lib/supabase-new/payments';

export default function TestSupabaseSetup() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [results, setResults] = useState<any>(null);

  const runTests = async () => {
    setStatus('testing');
    setMessage('Testing Supabase connection...');
    const testResults: any = {};

    try {
      // Test 1: Connection
      setMessage('Testing connection...');
      const { data: connectionTest, error: connError } = await supabase
        .from('members')
        .select('count')
        .limit(1);
      
      testResults.connection = connError ? { error: connError.message } : { success: true };

      // Test 2: Add Member
      setMessage('Testing add member...');
      const testMember = {
        name: 'Test Member',
        phone: '03001234567',
        gender: 'Male',
        cnic: '12345-1234567-1',
        membership_type: 'monthly',
        ac_type: 'without_ac',
        amount: 2500,
        start_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
      };

      const { data: memberData, error: memberError } = await addMember(testMember);
      testResults.addMember = memberError 
        ? { error: memberError.message } 
        : { success: true, memberId: memberData?.id };

      if (memberError || !memberData) {
        throw new Error('Failed to add member');
      }

      // Test 3: Get All Members
      setMessage('Testing get all members...');
      const { data: members, error: getError } = await getAllMembers();
      testResults.getAllMembers = getError 
        ? { error: getError.message } 
        : { success: true, count: members?.length || 0 };

      // Test 4: Record Attendance
      setMessage('Testing record attendance...');
      const today = new Date().toISOString().split('T')[0];
      const { data: attendanceData, error: attendanceError } = await recordAttendance(
        memberData.id,
        today
      );
      testResults.recordAttendance = attendanceError 
        ? { error: attendanceError.message } 
        : { success: true, attendanceId: attendanceData?.id };

      // Test 5: Record Payment
      setMessage('Testing record payment...');
      const { data: paymentData, error: paymentError } = await recordPayment(
        memberData.id,
        2500,
        'cash',
        today
      );
      testResults.recordPayment = paymentError 
        ? { error: paymentError.message } 
        : { success: true, paymentId: paymentData?.id };

      // Cleanup: Delete test member
      setMessage('Cleaning up test data...');
      await supabase.from('members').delete().eq('id', memberData.id);

      setStatus('success');
      setMessage('✅ All tests passed!');
      setResults(testResults);

    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Test failed: ${error.message}`);
      setResults(testResults);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Supabase Setup Test</h1>
          <p className="text-slate-600 mb-6">
            This page tests your Supabase connection and CRUD operations.
          </p>

          <div className="space-y-4">
            <button
              onClick={runTests}
              disabled={status === 'testing'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'testing' ? 'Testing...' : 'Run Tests'}
            </button>

            {message && (
              <div className={`p-4 rounded-md ${
                status === 'success' ? 'bg-green-50 text-green-800' :
                status === 'error' ? 'bg-red-50 text-red-800' :
                'bg-blue-50 text-blue-800'
              }`}>
                {message}
              </div>
            )}

            {results && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4">Test Results:</h2>
                <pre className="bg-slate-100 p-4 rounded-md overflow-auto text-sm">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Before Testing:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
                <li>Go to Supabase Dashboard → SQL Editor</li>
                <li>Run the SQL script: <code className="bg-yellow-100 px-1 rounded">supabase/00-complete-setup.sql</code></li>
                <li>Wait for "✅ Setup Complete!" message</li>
                <li>Then click "Run Tests" above</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

