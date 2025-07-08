'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  DollarSign,
  CreditCard,
  Archive,
  BarChartBig,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/income', label: 'Ingresos', icon: DollarSign },
  { href: '/dashboard/expenses', label: 'Egresos', icon: CreditCard },
  { href: '/dashboard/inventory', label: 'Inventario', icon: Archive },
  { href: '/dashboard/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/dashboard/cost-analysis', label: 'Análisis de Costos', icon: BarChartBig },
  { href: '/dashboard/ai-suggestions', label: 'Sugerencias IA', icon: Sparkles },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <nav className="space-y-1">
        {navItems.map((item) => {
          // Para el dashboard, coincidir exactamente con /dashboard
          if (item.href === '/dashboard') {
            var isActive = pathname === item.href;
          } 
          // Para otras rutas, verificar si la ruta actual comienza con el href
          else {
            isActive = pathname.startsWith(item.href) || 
                     (pathname + '/').startsWith(item.href + '/');
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'sidebar-item',
                isActive && 'sidebar-item-active',
                'group'
              )}
            >
              <item.icon 
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200',
                  isActive ? 'text-sidebar-primary' : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
                )} 
                aria-hidden="true" 
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}