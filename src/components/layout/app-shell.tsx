'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LayoutGrid, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SiteHeader } from './site-header';
import SidebarNav from './sidebar-nav';
import { useAuth } from '@/providers/auth-provider';

// Simple Sidebar Component
export function Sidebar({ isOpen, onClose, className, ...props }: {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div 
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transition-transform duration-300 ease-in-out transform',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0 md:static md:w-64',
        className
      )}
      {...props}
    >
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b flex items-center justify-between bg-white">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
            <LayoutGrid className="h-6 w-6 text-primary" />
            <span>ContableVision</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar menú</span>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 bg-white">
          <SidebarNav />
        </div>
      </div>
    </div>
  );
}

// Simple Sidebar Inset Component
function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        'flex-1 flex flex-col min-h-screen transition-all duration-300',
        className
      )}
      {...props}
    />
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <div className="flex-1">
          <SiteHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        className="md:w-64"
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        <SiteHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}