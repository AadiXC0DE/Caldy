'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { CalendarDays, CheckSquare, Clock, BellRing, AlarmClock } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  format,
  isSameDay,
  isAfter,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import CalendarView from '@/components/calendar/CalendarView';
import TaskList from '@/components/tasks/TaskList';
import AddEventDialog from '@/components/calendar/AddEventDialog';
import AddTaskDialog from '@/components/tasks/AddTaskDialog';

function DashboardPageClient() {
  const { events, tasks, categories } = useApp();
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
  }, []);

  const todaysEvents = useMemo(() => {
    if (!currentTime) {
      return [];
    }

    return events
      .filter((event) => isSameDay(new Date(event.start), currentTime))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [currentTime, events]);

  const incompleteTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);

  const dueTodayTasks = useMemo(() => {
    if (!currentTime) {
      return [];
    }

    return incompleteTasks.filter(
      (task) => task.dueDate && isSameDay(new Date(task.dueDate), currentTime),
    );
  }, [currentTime, incompleteTasks]);

  const upcomingTasks = useMemo(() => {
    if (!currentTime) {
      return [];
    }

    return incompleteTasks
      .filter(
        (task) =>
          task.dueDate &&
          isAfter(new Date(task.dueDate), currentTime) &&
          !isSameDay(new Date(task.dueDate), currentTime),
      )
      .slice(0, 5);
  }, [currentTime, incompleteTasks]);

  const highPriorityTasks = useMemo(
    () => incompleteTasks.filter((task) => task.priority === 'high').slice(0, 5),
    [incompleteTasks],
  );

  const greeting = useMemo(() => {
    if (!currentTime) {
      return { text: 'Welcome back', emoji: '✨' };
    }

    const hour = currentTime.getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
    if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
    return { text: 'Good evening', emoji: '🌙' };
  }, [currentTime]);

  const quotes = useMemo(
    () => [
      'The secret of getting ahead is getting started.',
      'Focus on being productive instead of busy.',
      'Either you run the day or the day runs you.',
      'Small daily improvements lead to stunning results.',
      'Plan your work and work your plan.',
      'Done is better than perfect.',
    ],
    [],
  );

  const dailyQuote = useMemo(() => {
    if (!currentTime) {
      return quotes[0];
    }

    const dayOfYear = Math.floor(
      (currentTime.getTime() - new Date(currentTime.getFullYear(), 0, 0).getTime()) / 86400000,
    );
    return quotes[dayOfYear % quotes.length];
  }, [currentTime, quotes]);

  const nextDeadline = useMemo(() => {
    if (!currentTime) {
      return null;
    }

    return (
      incompleteTasks
        .filter((t) => t.dueDate && isAfter(new Date(t.dueDate), currentTime))
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0] || null
    );
  }, [currentTime, incompleteTasks]);

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {greeting.emoji} {greeting.text}!
            </h1>
            <p className="text-muted-foreground mt-1 italic text-sm">&ldquo;{dailyQuote}&rdquo;</p>
            <p className="text-muted-foreground text-xs mt-1">
              {currentTime ? format(currentTime, 'EEEE, MMMM d, yyyy') : 'Loading today...'}{' '}
              &middot; {dueTodayTasks.length} task
              {dueTodayTasks.length !== 1 ? 's' : ''} due today
            </p>
          </div>
        </div>
      </motion.div>

      {/* Deadline Countdown */}
      {nextDeadline &&
        (() => {
          const dueDate = new Date(nextDeadline.dueDate!);
          const days = currentTime ? differenceInDays(dueDate, currentTime) : 0;
          const hours = currentTime ? differenceInHours(dueDate, currentTime) % 24 : 0;
          const mins = currentTime ? differenceInMinutes(dueDate, currentTime) % 60 : 0;
          const urgency =
            days <= 1 ? 'text-red-500' : days <= 3 ? 'text-yellow-500' : 'text-green-500';
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card
                className={`border-l-4 ${days <= 1 ? 'border-l-red-500' : days <= 3 ? 'border-l-yellow-500' : 'border-l-green-500'}`}
              >
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlarmClock className={`h-5 w-5 ${urgency}`} />
                    <div>
                      <span className="text-sm font-medium">{nextDeadline.title}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        due {format(dueDate, 'MMM d')}
                      </span>
                    </div>
                  </div>
                  <div className={`font-mono text-sm font-bold ${urgency}`}>
                    {days > 0 && `${days}d `}
                    {hours > 0 && `${hours}h `}
                    {`${mins}m`}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                Today&apos;s Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="h-[45vh]">
                <CalendarView showHeader={false} />
              </div>

              <div className="mt-5 space-y-3 flex-grow">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Today, {currentTime ? format(currentTime, 'EEEE, MMMM d') : 'your day'}
                </h3>

                {todaysEvents.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    No events scheduled for today
                  </p>
                ) : (
                  <div className="divide-y">
                    {todaysEvents.map((event) => {
                      const category = categories.find((c) => c.id === event.categoryId);
                      return (
                        <div key={event.id} className="py-3 flex items-start space-x-3">
                          <div className="flex-shrink-0 w-12 text-xs text-muted-foreground">
                            {event.allDay ? (
                              <span>All day</span>
                            ) : (
                              <span>{format(new Date(event.start), 'HH:mm')}</span>
                            )}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center">
                              {category && (
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: category.color }}
                                ></div>
                              )}
                              <span className="font-medium">{event.title}</span>
                            </div>
                            {event.location && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-auto pt-3 text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href="/calendar">View Full Calendar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Tabs defaultValue="today" className="h-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="priority">Priority</TabsTrigger>
            </TabsList>

            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <CheckSquare className="h-5 w-5 mr-2 text-primary" />
                  <TabsContent value="today">Tasks Due Today</TabsContent>
                  <TabsContent value="upcoming">Upcoming Tasks</TabsContent>
                  <TabsContent value="priority">High Priority</TabsContent>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-grow">
                <TabsContent value="today" className="h-[50vh] overflow-auto mt-0">
                  {dueTodayTasks.length === 0 ? (
                    <div className="py-10 text-center">
                      <CheckSquare className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-muted-foreground">No tasks due today</p>
                    </div>
                  ) : (
                    <TaskList tasks={dueTodayTasks} />
                  )}
                </TabsContent>

                <TabsContent value="upcoming" className="h-[50vh] overflow-auto mt-0">
                  {upcomingTasks.length === 0 ? (
                    <div className="py-10 text-center">
                      <Clock className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-muted-foreground">No upcoming tasks</p>
                    </div>
                  ) : (
                    <TaskList tasks={upcomingTasks} />
                  )}
                </TabsContent>

                <TabsContent value="priority" className="h-[50vh] overflow-auto mt-0">
                  {highPriorityTasks.length === 0 ? (
                    <div className="py-10 text-center">
                      <BellRing className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-muted-foreground">No high priority tasks</p>
                    </div>
                  ) : (
                    <TaskList tasks={highPriorityTasks} />
                  )}
                </TabsContent>
              </CardContent>

              <CardFooter className="pt-0">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/tasks">View All Tasks</Link>
                </Button>
              </CardFooter>
            </Card>
          </Tabs>
        </motion.div>
      </div>

      <AddEventDialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen} />

      <AddTaskDialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardPageClient />
    </Suspense>
  );
}
