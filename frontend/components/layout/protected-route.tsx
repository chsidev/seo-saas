"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { hasRole } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'admin' | 'team_member')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      // Check if user has required role
      const hasRequiredRole = allowedRoles.some(role => hasRole(user, role));
      if (!hasRequiredRole) {
        router.push('/dashboard');
      }
      return;
    }
  }, [user, loading, isAuthenticated, router, allowedRoles]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-96" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const hasRequiredRole = allowedRoles.some(role => hasRole(user, role));
    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
}