'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CalendarPlus, ListPlus, NotebookPen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingActionButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Don't show on landing page
  if (pathname === '/') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 sm:hidden">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Task button */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: -120, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="absolute bottom-0 right-0"
            >
              <Link href="/tasks?new=task" onClick={() => setIsOpen(false)}>
                <Button size="lg" className="rounded-full shadow-lg h-12 w-12" variant="outline">
                  <ListPlus className="h-5 w-5" />
                </Button>
              </Link>
              <span className="absolute right-14 top-1/2 -translate-y-1/2 text-xs font-medium bg-background border rounded-md px-2 py-1 whitespace-nowrap shadow-sm">
                New Task
              </span>
            </motion.div>

            {/* Event button */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: -64, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ delay: 0.05 }}
              className="absolute bottom-0 right-0"
            >
              <Link href="/calendar?new=event" onClick={() => setIsOpen(false)}>
                <Button size="lg" className="rounded-full shadow-lg h-12 w-12" variant="outline">
                  <CalendarPlus className="h-5 w-5" />
                </Button>
              </Link>
              <span className="absolute right-14 top-1/2 -translate-y-1/2 text-xs font-medium bg-background border rounded-md px-2 py-1 whitespace-nowrap shadow-sm">
                New Event
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: -176, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ delay: 0.1 }}
              className="absolute bottom-0 right-0"
            >
              <Link href="/notes?new=note" onClick={() => setIsOpen(false)}>
                <Button size="lg" className="rounded-full shadow-lg h-12 w-12" variant="outline">
                  <NotebookPen className="h-5 w-5" />
                </Button>
              </Link>
              <span className="absolute right-14 top-1/2 -translate-y-1/2 text-xs font-medium bg-background border rounded-md px-2 py-1 whitespace-nowrap shadow-sm">
                New Note
              </span>
            </motion.div>

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 -z-10"
              onClick={() => setIsOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div whileTap={{ scale: 0.9 }}>
        <Button
          size="lg"
          className="rounded-full shadow-xl h-14 w-14"
          onClick={() => setIsOpen(!isOpen)}
        >
          <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
            {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </motion.div>
        </Button>
      </motion.div>
    </div>
  );
}
