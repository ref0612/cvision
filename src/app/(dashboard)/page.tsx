import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirigir al inventario por defecto
  redirect('/dashboard/inventory');
  return null;
}
