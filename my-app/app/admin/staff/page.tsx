'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getAllUsers, createUser, updateUser, deleteUser } from '@/lib/data/users';
import { getAllGyms } from '@/lib/data/gyms';
import { User, UserRole, Gym } from '@/lib/auth/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Plus, Trash2 } from 'lucide-react';

export default function StaffPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [staff, setStaff] = useState<User[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'STAFF' as UserRole,
    gym_id: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (!loading && user?.role !== 'ADMIN') {
      router.push('/unauthorized');
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [usersData, gymsData] = await Promise.all([
        getAllUsers(),
        getAllGyms(),
      ]);
      setStaff(usersData.filter(u => u.role === 'STAFF'));
      setGyms(gymsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    if (formData.role === 'STAFF' && !formData.gym_id) {
      alert('Please select a gym for staff member');
      return;
    }

    setSubmitting(true);
    try {
      await createUser(
        formData.email,
        formData.password,
        formData.role,
        formData.role === 'STAFF' ? formData.gym_id : null
      );
      setFormData({ email: '', password: '', role: 'STAFF', gym_id: '' });
      setShowForm(false);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to create staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateGym = async (staffId: string, gymId: string) => {
    try {
      await updateUser(staffId, { gym_id: gymId });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to update staff member');
    }
  };

  const handleDelete = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await deleteUser(staffId);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete staff member');
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-600 mt-1">Manage staff members and assign them to gyms</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Staff Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="staff@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div>
                <label htmlFor="gym_id" className="block text-sm font-medium text-slate-700 mb-1">
                  Gym
                </label>
                <select
                  id="gym_id"
                  value={formData.gym_id}
                  onChange={(e) => setFormData({ ...formData, gym_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
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
                  {submitting ? 'Creating...' : 'Create Staff'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {staff.map((member) => {
          const gym = gyms.find(g => g.id === member.gym_id);
          return (
            <Card key={member.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{member.email}</h3>
                    <p className="text-sm text-slate-600">
                      Gym: {gym?.name || 'Not assigned'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Created: {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={member.gym_id || ''}
                      onChange={(e) => handleUpdateGym(member.id, e.target.value)}
                      className="px-3 py-1 border border-slate-300 rounded-md text-sm"
                    >
                      <option value="">No gym</option>
                      {gyms.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {staff.length === 0 && !loadingData && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No staff members yet. Add your first staff member!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

