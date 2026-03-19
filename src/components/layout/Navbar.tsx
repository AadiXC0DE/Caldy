'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  Sun,
  Moon,
  Menu,
  LayoutDashboard,
  CheckSquare,
  Timer,
  Flame,
  StickyNote,
  CalendarRange,
  Settings,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { AddNew } from './AddNew';
import { SearchBar } from './SearchBar';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function Navbar() {
  const { darkMode, toggleDarkMode } = useApp();
  const [mounted, setMounted] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const mobileNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendar', path: '/calendar', icon: CalendarDays },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Focus', path: '/focus', icon: Timer },
    { name: 'Habits', path: '/habits', icon: Flame },
    { name: 'Notes', path: '/notes', icon: StickyNote },
    { name: 'Planner', path: '/planner', icon: CalendarRange },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="flex h-16 items-center justify-between border-b bg-background/95 px-3 sm:px-5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="border-b px-5 py-4 text-left">
              <SheetTitle className="flex items-center gap-3 text-xl">
                <CalendarDays className="h-6 w-6 text-primary" />
                Caldy
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-2 px-3 py-4">
              {mobileNavItems.map(({ name, path, icon: Icon }) => (
                <Button
                  key={path}
                  asChild
                  variant="ghost"
                  className="h-11 w-full justify-start rounded-2xl px-3"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  <Link href={path}>
                    <Icon className="mr-3 h-5 w-5" />
                    {name}
                  </Link>
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center">
          <CalendarDays className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-lg font-bold">Caldy</h1>
        </div>
      </div>

      <div className="hidden md:block"></div>

      <div className="ml-auto flex items-center gap-1 sm:gap-3">
        <div className="w-full max-w-sm md:min-w-[220px]">
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
