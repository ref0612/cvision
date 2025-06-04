import React from 'react';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import SidebarNav from './sidebar-nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutGrid } from 'lucide-react'; // Icon for app name

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar collapsible="icon" variant="sidebar" side="left">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-primary">
            <LayoutGrid className="h-7 w-7 text-primary" />
            <span className="font-headline group-data-[collapsible=icon]:hidden">ContableVision</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-4">
          {/* Optional: Add footer content like settings or user profile button */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          <div className="md:hidden">
             <SidebarTrigger />
          </div>
          <div className="flex-1">
            {/* Placeholder for breadcrumbs or page title */}
          </div>
          <div>
            {/* Placeholder for user menu or actions */}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}