import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import { UserRole } from '@/lib/auth/types';

export async function checkAuth(request: NextRequest): Promise<{ user: any; error: string | null }> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { user: null, error: 'Unauthorized' };
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: 'Authentication failed' };
  }
}

export function checkRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export function requireRole(allowedRoles: UserRole[]) {
  return async (request: NextRequest) => {
    const { user, error } = await checkAuth(request);
    
    if (error || !user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (!checkRole(user.role, allowedRoles)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return null;
  };
}

export function requireAdmin() {
  return requireRole(['ADMIN']);
}

export function requireStaffOrAdmin() {
  return requireRole(['ADMIN', 'STAFF']);
}

