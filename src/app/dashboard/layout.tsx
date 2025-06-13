import { AppShell } from '@/components/layout/app-shell';
import { ReactNode } from 'react';
import ProtectedRoute from '@/components/auth/protected-route';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>
        {children}
      </AppShell>
    </ProtectedRoute>
  );
}
