'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarDays, Sun, Moon } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { AddNew } from './AddNew';
import { SearchBar } from './SearchBar';
import { motion } from 'framer-motion';

export function Navbar() {
  const { darkMode, toggleDarkMode } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="flex h-16 items-center justify-between border-b bg-background/95 px-5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center md:hidden">
        <div className="flex items-center mr-4">
          <CalendarDays className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-xl font-bold">Caldy</h1>
        </div>
      </div>

      <div className="hidden md:block"></div>

      <div className="ml-auto flex items-center gap-3">
        <div className="w-full max-w-sm min-w-[220px]">
          <SearchBar />
        </div>

        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full relative overflow-hidden"
          >
            <motion.div
              initial={false}
              animate={{ rotate: darkMode ? 0 : 180 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </motion.div>
            <span className="sr-only">Toggle dark mode</span>
          </Button>
        )}

        <AddNew />
      </div>
    </nav>
  );
}
