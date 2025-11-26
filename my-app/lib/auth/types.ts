export type UserRole = 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  gym_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Gym {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  gym_id: string | null;
}

