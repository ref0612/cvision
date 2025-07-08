'use client';

import { useAuth } from '@/providers/auth-provider';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated === true) {
      window.location.href = '/dashboard';
    } else if (isAuthenticated === false) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return null;
}