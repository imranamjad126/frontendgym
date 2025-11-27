'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getAllUsers, createUser } from '@/lib/data/users';
import { User, UserRole } from '@/lib/auth/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Plus } from 'lucide-react';

export default function OwnerStaffPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [staff, setStaff] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (!loading && user?.role !== 'OWNER') {
      router.push('/unauthorized');
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'OWNER' && user.gym_id) {
      loadStaff();
    }
  }, [user]);

  const loadStaff = async () => {
    if (!user?.gym_id) return;
    
    try {
      const usersData = await getAllUsers();
      // Filter staff from owner's gym
      const gymStaff = usersData.filter(
        u => u.role === 'STAFF' && u.gym_id === user.gym_id
      );
      setStaff(gymStaff);
    } catch (error) {
      console.error('Failed to load staff:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !user?.gym_id) {
      alert('Please fill all fields');
      return;
    }

    setSubmitting(true);
    try {
      await createUser(
        formData.email,
        formData.password,
        'STAFF' as UserRole,
        user.gym_id
      );
      setFormData({ email: '', password: '' });
      setShowForm(false);
      await loadStaff();
      alert('Staff member created successfully!');
    } catch (error: any) {
      console.error('Failed to create staff:', error);
      alert(error.message || 'Failed to create staff member');
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

  if (user?.role !== 'OWNER') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Staff</h1>
          <p className="text-slate-600 mt-1">Create and manage staff members for your gym</p>
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
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="staff@example.com"
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Members ({staff.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No staff members found</p>
          ) : (
            <div className="space-y-2">
              {staff.map((staffMember) => (
                <div
                  key={staffMember.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{staffMember.email}</p>
                    <p className="text-sm text-slate-500">Role: {staffMember.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

