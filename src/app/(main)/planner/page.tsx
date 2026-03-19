'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isWithinInterval,
  addWeeks,
  subWeeks,
} from 'date-fns';

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

function PlannerPageClient() {
  const { events, tasks } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const eventsForWeek = useMemo(() => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = event.end ? new Date(event.end) : eventStart;
      return weekDays.some(
        (day) =>
          isSameDay(day, eventStart) ||
          isSameDay(day, eventEnd) ||
          isWithinInterval(day, { start: eventStart, end: eventEnd }),
      );
    });
  }, [events, weekDays]);

  const tasksForWeek = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.dueDate || task.isTemplate) return false;
      const dueDate = new Date(task.dueDate);
      return weekDays.some((day) => isSameDay(day, dueDate));
    });
  }, [tasks, weekDays]);

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return eventsForWeek.filter((event) => {
      const eventStart = new Date(event.start);
      return isSameDay(eventStart, day) && eventStart.getHours() === hour;
    });
  };

  const getTasksForDay = (day: Date) => {
    return tasksForWeek.filter((task) => {
      const dueDate = new Date(task.dueDate!);
      return isSameDay(dueDate, day);
    });
  };

  const isToday = (day: Date) => isSameDay(day, new Date());
  const currentHour = new Date().getHours();

  return (
    <div className="container mx-auto max-w-[1400px] px-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <CalendarRange className="h-8 w-8 mr-2 text-primary" />
              Weekly Planner
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(weekDays[0], 'MMM d')} — {format(weekDays[6], 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate((prev) => subWeeks(prev, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate((prev) => addWeeks(prev, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tasks Banner */}
      {tasksForWeek.length > 0 && (
        <Card className="mb-4">
          <CardContent className="py-3 px-4">
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => {
                const dayTasks = getTasksForDay(day);
                if (dayTasks.length === 0) return null;
                return (
                  <div key={day.toISOString()} className="flex items-center gap-1 text-xs">
                    <span
                      className={`font-medium ${isToday(day) ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      {format(day, 'EEE')}:
                    </span>
                    {dayTasks.map((task) => (
                      <span
                        key={task.id}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                          task.completed
                            ? 'bg-green-500/10 text-green-600 line-through'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {task.title}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Day Headers */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b sticky top-0 bg-background z-10">
              <div className="p-2 border-r" />
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`p-2 text-center border-r last:border-r-0 ${
                    isToday(day) ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
                  <div className={`text-lg font-bold ${isToday(day) ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Rows */}
            <div className="relative">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid grid-cols-[60px_repeat(7,1fr)] border-b last:border-b-0 min-h-[50px]"
                >
                  <div className="p-1 pr-2 text-right text-xs text-muted-foreground border-r flex items-start justify-end pt-1">
                    {format(new Date().setHours(hour, 0), 'h a')}
                  </div>
                  {weekDays.map((day) => {
                    const hourEvents = getEventsForDayAndHour(day, hour);
                    return (
                      <div
                        key={`${day.toISOString()}-${hour}`}
                        className={`border-r last:border-r-0 p-0.5 min-h-[50px] relative ${
                          isToday(day) ? 'bg-primary/[0.02]' : ''
                        } ${isToday(day) && hour === currentHour ? 'bg-primary/5' : ''}`}
                      >
                        {hourEvents.map((event) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded px-1.5 py-0.5 text-[11px] mb-0.5 truncate font-medium"
                            style={{
                              backgroundColor: (event.color || 'var(--primary)') + '20',
                              color: event.color || 'var(--primary)',
                              borderLeft: `2px solid ${event.color || 'var(--primary)'}`,
                            }}
                            title={event.title}
                          >
                            {event.title}
                          </motion.div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Current Time Indicator */}
              {weekDays.some((d) => isToday(d)) && currentHour >= 6 && currentHour <= 23 && (
                <div
                  className="absolute left-[60px] right-0 h-0.5 bg-red-500 z-10 pointer-events-none"
                  style={{
                    top: `${((currentHour - 6 + new Date().getMinutes() / 60) / 18) * 100}%`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 -mt-[3px] -ml-[3px]" />
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-4">
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <PlannerPageClient />
    </Suspense>
  );
}
