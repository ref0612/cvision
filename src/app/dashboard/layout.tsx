import { AppShell } from '@/components/layout/app-shell';
import { ReactNode } from 'react';

// ProtectedRoute ya no es necesario aquí, el middleware maneja la protección.

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      {/* El <main> tag con padding y flex-1 ya está dentro de AppShell */}
      {/* Los children (page.tsx de cada módulo) se renderizarán dentro de ese <main> */}
      {children}
    </AppShell>
  );
}
