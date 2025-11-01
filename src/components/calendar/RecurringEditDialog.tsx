'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RecurringEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditThis: () => void;
  onEditAll: () => void;
}

export function RecurringEditDialog({
  open,
  onOpenChange,
  onEditThis,
  onEditAll,
}: RecurringEditDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Recurring Event</AlertDialogTitle>
          <AlertDialogDescription>
            This is a recurring event. What would you like to edit?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onEditThis}
            className="bg-blue-600 hover:bg-blue-700"
          >
            This Event Only
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onEditAll}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            All Events
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
