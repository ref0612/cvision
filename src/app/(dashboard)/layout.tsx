import { AppShell } from '@/components/layout/app-shell';
import ProtectedRoute from '@/components/auth/protected-route';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AppShell>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </AppShell>
    </ProtectedRoute>
  );
}
