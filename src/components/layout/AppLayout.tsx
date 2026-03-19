'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Confetti } from '@/components/common/Confetti';
import { FloatingActionButton } from '@/components/common/FloatingActionButton';
import { KeyboardShortcuts } from '@/components/common/KeyboardShortcuts';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
        <Toaster />
        <Confetti />
        <FloatingActionButton />
        <KeyboardShortcuts />
      </div>
    </AppProvider>
  );
}
