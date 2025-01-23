"use client"

import React from 'react';
import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Loader2 } from "lucide-react";
import { Toaster } from 'sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/auth/login");
  }

  return (
    <>
      <TooltipProvider>
        <div className="min-h-screen bg-muted/30 flex">
          {/* Mobile Sidebar - Overlay */}
          <div 
            className={cn(
              "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm",
              isSidebarOpen ? "block lg:hidden" : "hidden"
            )}
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <Sidebar 
            className={cn(
              "fixed left-0 top-0 z-40 w-64 h-screen overflow-y-auto",
              "transition-transform duration-200",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}
          />
          
          {/* Main Content */}
          <div className="flex-1 ml-0 lg:ml-64 flex flex-col min-h-screen">
            <Header onMenuClick={() => setIsSidebarOpen(true)} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="mx-auto max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </div>
      </TooltipProvider>
      <Toaster />
    </>
  );
}