'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Calendar as CalendarIcon, PlusCircle, Grid3X3, Columns, LayoutList } from 'lucide-react';
import { motion } from 'framer-motion';
import CalendarView from '@/components/calendar/CalendarView';
import AddEventDialog from '@/components/calendar/AddEventDialog';

export default function CalendarPage() {
  const { view, setView } = useApp();
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  
  const handleChangeView = (newView: 'month' | 'week' | 'day' | 'list') => {
    setView(newView);
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <CalendarIcon className="h-8 w-8 mr-2 text-primary" />
              Calendar
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your schedule and events
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-background border rounded-lg p-1 flex items-center">
              <Button
                variant={view === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleChangeView('month')}
                className="rounded-md"
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                Month
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleChangeView('week')}
                className="rounded-md"
              >
                <Columns className="h-4 w-4 mr-1" />
                Week
              </Button>
              <Button
                variant={view === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleChangeView('day')}
                className="rounded-md"
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Day
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleChangeView('list')}
                className="rounded-md"
              >
                <LayoutList className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>

            <Button onClick={() => setIsAddEventOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full"
      >
        <Card>
          <CardContent className="p-0 sm:p-1 md:p-2 lg:p-3 h-[calc(100vh-12rem)]">
            <CalendarView />
          </CardContent>
        </Card>
      </motion.div>
      
      <AddEventDialog 
        open={isAddEventOpen} 
        onOpenChange={setIsAddEventOpen} 
      />
    </div>
  );
} 