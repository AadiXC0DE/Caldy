'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['⌘', 'K'], description: 'Open search' },
  { keys: ['⌘', 'N'], description: 'New task' },
  { keys: ['⌘', 'E'], description: 'New event' },
  { keys: ['⌘', '⇧', 'N'], description: 'New note' },
  { keys: ['?'], description: 'Show shortcuts' },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const [showHelp, setShowHelp] = useState(false);

  // Don't activate on landing page
  const isActive = pathname !== '/';

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive) return;

      // Ignore when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Cmd/Ctrl + K → focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder*="Search"]',
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.click();
        }
      }

      // Cmd/Ctrl + N → new task
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        router.push('/tasks?new=task');
      }

      // Cmd/Ctrl + E → new event
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        router.push('/calendar?new=event');
      }

      // Cmd/Ctrl + Shift + N -> new note
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        router.push('/notes?new=note');
      }

      // ? → show shortcuts help
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowHelp(true);
      }
    },
    [isActive, router],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Dialog open={showHelp} onOpenChange={setShowHelp}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          {SHORTCUTS.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <kbd
                    key={j}
                    className="px-2 py-1 text-xs font-mono bg-muted rounded border shadow-sm"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
