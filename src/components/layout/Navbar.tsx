'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CalendarDays, CheckSquare, Settings, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { AddNew } from './AddNew';

export function Navbar() {
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useApp();
  
  const isActive = (path: string) => pathname === path;
  
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5 mr-2" />,
    },
    {
      name: 'Calendar',
      path: '/calendar',
      icon: <CalendarDays className="h-5 w-5 mr-2" />,
    },
    {
      name: 'Tasks',
      path: '/tasks',
      icon: <CheckSquare className="h-5 w-5 mr-2" />,
    },
  ];

  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-bold mr-8 flex items-center">
            <CalendarDays className="h-6 w-6 mr-2 text-primary" />
            Caldy
          </h1>
        </Link>
        
        <div className="hidden md:flex space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              asChild
              variant={isActive(item.path) ? 'default' : 'ghost'}
              className={cn(
                'flex items-center',
                isActive(item.path) && 'font-semibold'
              )}
            >
              <Link href={item.path} className="flex items-center">
                {item.icon}
                {item.name}
              </Link>
            </Button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleDarkMode}
          className="rounded-full"
        >
          {darkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle dark mode</span>
        </Button>
        
        <AddNew />
        
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-6">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    asChild
                    variant={isActive(item.path) ? 'default' : 'ghost'}
                    className="justify-start"
                  >
                    <Link href={item.path} className="flex items-center">
                      {item.icon}
                      {item.name}
                    </Link>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
} 