'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleChangeView = useCallback((newView: 'month' | 'week' | 'day' | 'list') => {
    setView(newView);
  }, [setView]);

  const handleAddEventOpen = useCallback(() => {
    setIsAddEventOpen(true);
  }, []);

  const viewToggleButtons = useMemo(() => {
    if (!mounted) {
      return <div className="h-10 w-[300px] bg-background/80 rounded-lg border"></div>;
    }
    
    return (
      <div className="bg-background border rounded-lg p-1 flex flex-wrap items-center w-full md:w-auto">
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
    );
  }, [mounted, view, handleChangeView]);

  const headerSection = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <CalendarIcon className="h-8 w-8 mr-2 text-primary" />
            Your Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your schedule and events
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
          {viewToggleButtons}

          <Button 
            onClick={handleAddEventOpen}
            className="w-full md:w-auto h-9"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>
    </motion.div>
  ), [viewToggleButtons, handleAddEventOpen]);

  const calendarSection = useMemo(() => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full"
    >
      <Card>
        <CardContent className="p-0 sm:p-1 md:p-2 lg:p-3 h-[calc(100vh-15rem)]">
          <CalendarView showHeader={true} />
        </CardContent>
      </Card>
    </motion.div>
  ), []);

  return (
    <div className="space-y-4">
      {headerSection}
      {calendarSection}
      
      <AddEventDialog 
        open={isAddEventOpen} 
        onOpenChange={setIsAddEventOpen} 
      />
    </div>
  );
} 