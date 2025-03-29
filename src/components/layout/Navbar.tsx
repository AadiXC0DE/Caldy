'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  CalendarDays, 
  CheckSquare, 
  Settings, 
  Sun, 
  Moon, 
  LayoutDashboard,
  X,
  CalendarPlus,
  ListPlus 
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { AddNew } from './AddNew';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

export function Navbar() {
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useApp();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
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
        {mounted && (
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full hidden sm:flex relative overflow-hidden"
          >
            <motion.div
              initial={false}
              animate={{ rotate: darkMode ? 0 : 180 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {darkMode ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </motion.div>
            <span className="sr-only">Toggle dark mode</span>
          </Button>
        )}
        
        <div className="hidden sm:block">
          <AddNew />
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
            <SheetContent side="right" className="w-[85%] p-0 border-l">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarDays className="h-6 w-6 mr-2 text-primary" />
                    <h2 className="text-xl font-semibold">Caldy</h2>
                  </div>
                </div>
                
                {/* Navigation items */}
                <div className="px-2 py-4 flex-1 overflow-auto">
                  <div className="space-y-1">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: index * 0.1,
                          ease: "easeOut" 
                        }}
                      >
                        <SheetClose asChild>
                          <Button
                            asChild
                            variant={isActive(item.path) ? 'default' : 'ghost'}
                            className="w-full justify-start mb-1"
                            size="lg"
                          >
                            <Link href={item.path} className="flex items-center">
                              {item.icon}
                              {item.name}
                            </Link>
                          </Button>
                        </SheetClose>
                      </motion.div>
                    ))}
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground px-3 py-1">
                      Quick Actions
                    </h3>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <SheetClose asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start mb-2"
                          asChild
                        >
                          <Link href="/calendar?new=event">
                            <CalendarPlus className="h-5 w-5 mr-2" />
                            New Event
                          </Link>
                        </Button>
                      </SheetClose>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <SheetClose asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          asChild
                        >
                          <Link href="/tasks?new=task">
                            <ListPlus className="h-5 w-5 mr-2" />
                            New Task
                          </Link>
                        </Button>
                      </SheetClose>
                    </motion.div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    {mounted && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2 relative" 
                        onClick={toggleDarkMode}
                      >
                        <motion.div
                          initial={false}
                          animate={{ 
                            rotate: darkMode ? 0 : 180,
                            x: darkMode ? 0 : -4
                          }}
                          transition={{ duration: 0.5, type: "spring" }}
                          className="flex items-center justify-center"
                        >
                          {darkMode ? (
                            <Sun className="h-4 w-4" />
                          ) : (
                            <Moon className="h-4 w-4" />
                          )}
                        </motion.div>
                        <span className="text-sm ml-2">
                          {darkMode ? "Dark Mode" : "Light Mode"}
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
} 