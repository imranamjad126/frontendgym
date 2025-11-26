'use client';

import { useState } from 'react';
import { supabase } from '@/lib/auth/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SetupAdminPage() {
  const [email, setEmail] = useState('fitnesswithimran1@gmail.com');
  const [password, setPassword] = useState('Aa543543@');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreateAdmin = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (authError) {
        // If user already exists, try to sign in to get the user ID
        if (authError.message.includes('already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            throw new Error('User exists but password is incorrect. Please reset password in Supabase Dashboard.');
          }

          // User exists, now create/update users table record
          const { error: userError } = await supabase
            .from('users')
            .upsert({
              id: signInData.user!.id,
              email,
              role: 'ADMIN',
              gym_id: null,
            }, {
              onConflict: 'id',
            });

          if (userError) {
            throw userError;
          }

          setMessage({ type: 'success', text: 'Admin user already exists and has been updated in users table!' });
          return;
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Step 2: Confirm email (for development, we'll update directly)
      // In production, user should confirm via email
      const { error: confirmError } = await supabase.auth.admin.updateUserById(
        authData.user.id,
        { email_confirm: true }
      );

      if (confirmError) {
        console.warn('Could not auto-confirm email (requires admin access):', confirmError);
        setMessage({ 
          type: 'error', 
          text: 'User created but email confirmation failed. Please confirm email in Supabase Dashboard → Authentication → Users' 
        });
      }

      // Step 3: Create user record in users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          role: 'ADMIN',
          gym_id: null,
        });

      if (userError) {
        // If record already exists, update it
        if (userError.code === '23505') { // Unique violation
          const { error: updateError } = await supabase
            .from('users')
            .update({ role: 'ADMIN', gym_id: null })
            .eq('id', authData.user.id);

          if (updateError) {
            throw updateError;
          }
          setMessage({ type: 'success', text: 'Admin user created successfully! You can now login.' });
        } else {
          throw userError;
        }
      } else {
        setMessage({ type: 'success', text: 'Admin user created successfully! You can now login.' });
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to create admin user. Check console for details.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Setup Admin User</CardTitle>
          <p className="text-center text-slate-600 mt-2 text-sm">
            Create the initial admin user for the system
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className={`px-4 py-3 rounded ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <Button
            onClick={handleCreateAdmin}
            disabled={loading || !email || !password}
            className="w-full"
          >
            {loading ? 'Creating Admin...' : 'Create Admin User'}
          </Button>

          <div className="text-xs text-slate-500 space-y-1 pt-4 border-t">
            <p><strong>Note:</strong> This page should only be used for initial setup.</p>
            <p>After creating the admin, you can login at <code className="bg-slate-100 px-1 rounded">/login</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

