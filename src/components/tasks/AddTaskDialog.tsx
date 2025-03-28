'use client';

import React from 'react';
import TaskDetailDialog from './TaskDetailDialog';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddTaskDialog({ open, onOpenChange }: AddTaskDialogProps) {
  return (
    <TaskDetailDialog
      open={open}
      onOpenChange={onOpenChange}
      task={null}
    />
  );
} 