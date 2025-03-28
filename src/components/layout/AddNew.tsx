'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarPlus, ListPlus, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddEventDialog from '@/components/calendar/AddEventDialog';
import AddTaskDialog from '@/components/tasks/AddTaskDialog';

export function AddNew() {
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="hidden sm:flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsAddEventOpen(true)}>
            <CalendarPlus className="h-4 w-4 mr-2" />
            New Event
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsAddTaskOpen(true)}>
            <ListPlus className="h-4 w-4 mr-2" />
            New Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddEventDialog 
        open={isAddEventOpen} 
        onOpenChange={setIsAddEventOpen} 
      />
      
      <AddTaskDialog 
        open={isAddTaskOpen} 
        onOpenChange={setIsAddTaskOpen} 
      />
    </>
  );
} 