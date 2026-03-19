'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  CheckSquare,
  Settings,
  LayoutDashboard,
  Timer,
  Flame,
  StickyNote,
  CalendarRange,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClerk, useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_'));

function LocalModeFooter({ isCollapsed }: { isCollapsed: boolean }) {
  if (isCollapsed) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-full"
        disabled
        aria-label="Pro coming soon"
      >
        <Crown className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border bg-background/80 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Free local mode</p>
          <p className="text-xs text-muted-foreground">Your workspace stays on this device.</p>
        </div>
        <Badge variant="secondary">Coming soon</Badge>
      </div>
      <Button variant="outline" size="sm" className="mt-3 w-full" disabled>
        <Crown className="mr-2 h-4 w-4" />
        Pro coming soon
      </Button>
    </div>
  );
}

function ClerkSidebarFooter({ isCollapsed }: { isCollapsed: boolean }) {
  const { signOut } = useClerk();
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div
        className={cn(
          'rounded-2xl border bg-background/80 shadow-sm',
          isCollapsed ? 'h-12' : 'h-24 p-3',
        )}
      />
    );
  }

  if (!isSignedIn) {
    if (isCollapsed) {
      return (
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-full"
          disabled
          aria-label="Pro coming soon"
        >
          <Crown className="h-5 w-5" />
        </Button>
      );
    }

    return (
      <div className="rounded-2xl border bg-background/80 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Local-first launch</p>
            <p className="text-xs text-muted-foreground">
              The full local product is live now. Pro and account features can be turned on later.
            </p>
          </div>
          <Badge variant="secondary">Free</Badge>
        </div>
        <Button variant="outline" size="sm" className="mt-3 w-full" disabled>
          <Crown className="mr-2 h-4 w-4" />
          Pro coming soon
        </Button>
      </div>
    );
  }

  const isPro = Boolean(user.publicMetadata?.hasAccess);
  const userEmail = user.primaryEmailAddress?.emailAddress || 'Signed in';

  if (isCollapsed) {
    return (
      <Button asChild variant="ghost" size="icon" className="w-full h-12">
        <Link href="/settings" aria-label="Open account settings">
          {isPro ? <Crown className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
        </Link>
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border bg-background/80 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{userEmail}</p>
          <p className="text-xs text-muted-foreground">
            {isPro ? 'Pro account active' : 'Free local account'}
          </p>
        </div>
        <Badge variant={isPro ? 'default' : 'secondary'}>{isPro ? 'Pro' : 'Free'}</Badge>
      </div>
      <div className="mt-3 flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href="/settings">Manage</Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={() => signOut({ redirectUrl: '/' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Helper to check if a link is active
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-6 w-6" />,
    },
    {
      name: 'Calendar',
      path: '/calendar',
      icon: <CalendarDays className="h-6 w-6" />,
    },
    {
      name: 'Tasks',
      path: '/tasks',
      icon: <CheckSquare className="h-6 w-6" />,
    },
    {
      name: 'Focus',
      path: '/focus',
      icon: <Timer className="h-6 w-6" />,
    },
    {
      name: 'Habits',
      path: '/habits',
      icon: <Flame className="h-6 w-6" />,
    },
    {
      name: 'Notes',
      path: '/notes',
      icon: <StickyNote className="h-6 w-6" />,
    },
    {
      name: 'Planner',
      path: '/planner',
      icon: <CalendarRange className="h-6 w-6" />,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings className="h-6 w-6" />,
    },
  ];

  return (
    <motion.aside
      className={cn(
        'relative flex flex-col h-screen border-r bg-card/50 backdrop-blur-xl',
        isCollapsed ? 'w-[78px]' : 'w-64',
      )}
      initial={false}
      animate={{ width: isCollapsed ? 78 : 256 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div
        className={cn(
          'flex h-16 items-center border-b px-4',
          isCollapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!isCollapsed && (
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3 overflow-hidden">
            <CalendarDays className="h-8 w-8 text-primary shrink-0" />
            <AnimatePresence>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="whitespace-nowrap text-[1.65rem] font-bold leading-none"
              >
                Caldy
              </motion.span>
            </AnimatePresence>
          </Link>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'hidden h-9 w-9 shrink-0 rounded-xl border bg-background/80 shadow-sm md:inline-flex',
            isCollapsed && 'mx-auto',
          )}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <Button
            key={item.path}
            asChild
            variant={isActive(item.path) ? 'secondary' : 'ghost'}
            className={cn(
              'h-11 w-full justify-start rounded-2xl transition-all duration-200',
              isActive(item.path) && 'bg-primary/10 text-primary hover:bg-primary/15 font-medium',
              isCollapsed ? 'justify-center px-0' : 'px-3',
            )}
          >
            <Link href={item.path} className="flex items-center">
              <span className={cn('shrink-0', isCollapsed ? '' : 'mr-4')}>{item.icon}</span>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap text-base"
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          </Button>
        ))}
      </div>

      <div className="mt-auto border-t p-3">
        {isClerkConfigured ? (
          <ClerkSidebarFooter isCollapsed={isCollapsed} />
        ) : (
          <LocalModeFooter isCollapsed={isCollapsed} />
        )}
      </div>
    </motion.aside>
  );
}
