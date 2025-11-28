'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getAllGyms, createGym } from '@/lib/data/gyms';
import { Gym } from '@/lib/auth/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Plus } from 'lucide-react';

export default function GymsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loadingGyms, setLoadingGyms] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [gymName, setGymName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = user?.email === 'fitnesswithimran1@gmail.com';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (!loading && !isSuperAdmin) {
      router.push('/unauthorized');
      return;
    }
  }, [user, loading, router, isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) {
      loadGyms();
    }
  }, [isSuperAdmin]);

  const loadGyms = async () => {
    try {
      const data = await getAllGyms();
      setGyms(data);
    } catch (error) {
      console.error('Failed to load gyms:', error);
    } finally {
      setLoadingGyms(false);
    }
  };

  const handleCreateGym = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymName.trim()) return;

    setSubmitting(true);
    try {
      await createGym(gymName.trim());
      setGymName('');
      setShowForm(false);
      await loadGyms();
    } catch (error: any) {
      alert(error.message || 'Failed to create gym');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingGyms) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gyms Management</h1>
          <p className="text-slate-600 mt-1">Manage all gym locations</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Gym
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Gym</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGym} className="space-y-4">
              <div>
                <label htmlFor="gymName" className="block text-sm font-medium text-slate-700 mb-1">
                  Gym Name
                </label>
                <Input
                  id="gymName"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  placeholder="Enter gym name"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Gym'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gyms.map((gym) => (
          <Card key={gym.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                <CardTitle>{gym.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Created: {new Date(gym.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {gyms.length === 0 && !loadingGyms && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No gyms yet. Create your first gym!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}



