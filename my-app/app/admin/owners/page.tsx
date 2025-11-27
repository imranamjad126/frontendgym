'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getAllUsers, createUser, updateUser } from '@/lib/data/users';
import { getAllGyms } from '@/lib/data/gyms';
import { User, UserRole, Gym } from '@/lib/auth/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Plus } from 'lucide-react';

export default function OwnersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isSuperAdmin = user?.email === 'fitnesswithimran1@gmail.com';
  const [owners, setOwners] = useState<User[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    gym_id: '',
  });
  const [submitting, setSubmitting] = useState(false);

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
      loadData();
    }
  }, [isSuperAdmin]);

  const loadData = async () => {
    try {
      const [usersData, gymsData] = await Promise.all([
        getAllUsers(),
        getAllGyms(),
      ]);
      setOwners(usersData.filter(u => u.role === 'OWNER'));
      setGyms(gymsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.gym_id) {
      alert('Please fill all fields');
      return;
    }

    setSubmitting(true);
    try {
      await createUser(
        formData.email,
        formData.password,
        'OWNER' as UserRole,
        formData.gym_id
      );
      setFormData({ email: '', password: '', gym_id: '' });
      setShowForm(false);
      await loadData();
      alert('Owner created successfully!');
    } catch (error: any) {
      console.error('Failed to create owner:', error);
      alert(error.message || 'Failed to create owner');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingData) {
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
          <h1 className="text-3xl font-bold text-slate-900">Manage Owners</h1>
          <p className="text-slate-600 mt-1">Create and manage gym owners</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Owner
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOwner} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="owner@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gym</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  value={formData.gym_id}
                  onChange={(e) => setFormData({ ...formData, gym_id: e.target.value })}
                  required
                >
                  <option value="">Select a gym</option>
                  {gyms.map((gym) => (
                    <option key={gym.id} value={gym.id}>
                      {gym.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Owner'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Owners ({owners.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {owners.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No owners found</p>
          ) : (
            <div className="space-y-2">
              {owners.map((owner) => {
                const gym = gyms.find(g => g.id === owner.gym_id);
                return (
                  <div
                    key={owner.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{owner.email}</p>
                      <p className="text-sm text-slate-500">
                        Gym: {gym?.name || 'No gym assigned'}
                      </p>
                    </div>
                    <div className="text-sm text-slate-600">
                      {owner.role}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

