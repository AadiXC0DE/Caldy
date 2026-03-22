'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { CalendarDays, CheckSquare, Clock, BellRing, AlarmClock, Plus } from 'lucide-react';
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
import { PageHeader } from '@/components/layout/PageHeader';

function DashboardPageClient() {
  const { events, tasks, categories } = useApp();
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskView, setTaskView] = useState<'today' | 'upcoming' | 'priority'>('today');
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

  const taskViewMeta = {
    today: {
      title: 'Tasks Due Today',
      icon: CheckSquare,
      emptyLabel: 'No tasks due today',
      emptyIcon: CheckSquare,
      tasks: dueTodayTasks,
    },
    upcoming: {
      title: 'Upcoming Tasks',
      icon: Clock,
      emptyLabel: 'No upcoming tasks',
      emptyIcon: Clock,
      tasks: upcomingTasks,
    },
    priority: {
      title: 'High Priority Tasks',
      icon: BellRing,
      emptyLabel: 'No high priority tasks',
      emptyIcon: BellRing,
      tasks: highPriorityTasks,
    },
  } as const;

  const renderTaskViewHeader = (view: keyof typeof taskViewMeta) => {
    const currentView = taskViewMeta[view];
    const ViewIcon = currentView.icon;

    return (
      <>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <ViewIcon className="h-5 w-5 text-primary" />
          {currentView.title}
        </CardTitle>
        <CardDescription>Switch views to focus on what needs attention next.</CardDescription>
      </>
    );
  };

  const renderTaskViewBody = (view: keyof typeof taskViewMeta) => {
    const currentView = taskViewMeta[view];
    const EmptyIcon = currentView.emptyIcon;

    return (
      <>
        {currentView.tasks.length === 0 ? (
          <div className="py-10 text-center">
            <EmptyIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">{currentView.emptyLabel}</p>
          </div>
        ) : (
          <TaskList tasks={currentView.tasks} />
        )}
      </>
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={`${greeting.emoji} ${greeting.text}`}
        description={
          <div className="space-y-2">
            <p className="italic text-muted-foreground">&ldquo;{dailyQuote}&rdquo;</p>
            <p>
              {currentTime ? format(currentTime, 'EEEE, MMMM d, yyyy') : 'Loading today...'} ·{' '}
              {dueTodayTasks.length} task{dueTodayTasks.length !== 1 ? 's' : ''} due today
            </p>
          </div>
        }
        actions={
          <>
            <Button variant="outline" onClick={() => setIsAddEventOpen(true)}>
              <Plus className="h-4 w-4" />
              Event
            </Button>
            <Button onClick={() => setIsAddTaskOpen(true)}>
              <Plus className="h-4 w-4" />
              Task
            </Button>
          </>
        }
      />

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
                className={`overflow-hidden border-l-4 ${days <= 1 ? 'border-l-red-500' : days <= 3 ? 'border-l-yellow-500' : 'border-l-green-500'}`}
              >
                <CardContent className="flex items-center justify-between py-4 px-4">
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="h-full overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <CalendarDays className="h-5 w-5 text-primary" />
                Today&apos;s Schedule
              </CardTitle>
              <CardDescription>Calendar and events for the current day.</CardDescription>
            </CardHeader>
            <CardContent className="flex h-full flex-col">
              <div className="h-[42vh] min-h-[320px]">
                <CalendarView showHeader={false} />
              </div>

              <div className="mt-5 flex-grow space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {currentTime ? format(currentTime, 'EEEE, MMMM d') : 'Your day'}
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

              <div className="mt-auto pt-4 text-right">
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
          <Tabs
            value={taskView}
            onValueChange={(value) => setTaskView(value as keyof typeof taskViewMeta)}
            className="h-full"
          >
            <TabsList className="mb-4 grid w-full grid-cols-3 rounded-xl bg-muted/60 p-1">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="priority">Priority</TabsTrigger>
            </TabsList>

            <Card className="flex h-full flex-col overflow-hidden">
              <CardHeader className="pb-3">{renderTaskViewHeader(taskView)}</CardHeader>

              <CardContent className="flex-grow">
                <TabsContent value="today" className="h-[50vh] overflow-auto mt-0">
                  {renderTaskViewBody('today')}
                </TabsContent>

                <TabsContent value="upcoming" className="h-[50vh] overflow-auto mt-0">
                  {renderTaskViewBody('upcoming')}
                </TabsContent>

                <TabsContent value="priority" className="h-[50vh] overflow-auto mt-0">
                  {renderTaskViewBody('priority')}
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
