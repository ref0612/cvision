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
  ShoppingBag, // Icon for Orders
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/income', label: 'Ingresos', icon: DollarSign },
  { href: '/expenses', label: 'Egresos', icon: CreditCard },
  { href: '/inventory', label: 'Inventario', icon: Archive },
  { href: '/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/cost-analysis', label: 'Análisis de Costos', icon: BarChartBig },
  { href: '/ai-suggestions', label: 'Sugerencias IA', icon: Sparkles },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard' && item.href.length > 1 && pathname.substring(item.href.length).startsWith('/')) || (pathname.startsWith(item.href) && item.href.length > 1 && pathname.length === item.href.length)}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}