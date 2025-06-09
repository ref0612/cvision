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
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || 
          (pathname.startsWith(item.href) && item.href !== '/dashboard' && 
           item.href.length > 1 && pathname.substring(item.href.length).startsWith('/')) || 
          (pathname.startsWith(item.href) && item.href.length > 1 && pathname.length === item.href.length);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors',
              isActive 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              'group'
            )}
          >
            <item.icon 
              className={cn(
                'mr-3 h-5 w-5 flex-shrink-0',
                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
              )} 
              aria-hidden="true" 
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}