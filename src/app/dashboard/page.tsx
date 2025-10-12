'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { CalendarDays, CheckSquare, PlusCircle, Clock, BellRing } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isSameDay, isAfter } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import CalendarView from '@/components/calendar/CalendarView';
import TaskList from '@/components/tasks/TaskList';
import AddEventDialog from '@/components/calendar/AddEventDialog';
import AddTaskDialog from '@/components/tasks/AddTaskDialog';
import { TaskStats } from '@/components/tasks/TaskStats';

function DashboardPageClient() {
  const { events, tasks, categories } = useApp();
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  
  const today = useMemo(() => new Date(), []);
  
  // Memoize filtered events and tasks
  const todaysEvents = useMemo(() => 
    events.filter(event => 
      isSameDay(new Date(event.start), today)
    ).sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    ), [events, today]);
  
  const incompleteTasks = useMemo(() => 
    tasks.filter(task => !task.completed), 
    [tasks]
  );
  
  const dueTodayTasks = useMemo(() => 
    incompleteTasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), today)
    ), 
    [incompleteTasks, today]
  );
  
  const upcomingTasks = useMemo(() => 
    incompleteTasks.filter(task => 
      task.dueDate && isAfter(new Date(task.dueDate), today) && 
      !isSameDay(new Date(task.dueDate), today)
    ).slice(0, 5),
    [incompleteTasks, today]
  );
  
  const highPriorityTasks = useMemo(() => 
    incompleteTasks
      .filter(task => task.priority === 'high')
      .slice(0, 5),
    [incompleteTasks]
  );

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
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome to Caldy! Here&apos;s your overview for today.
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAddTaskOpen(true)}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              New Task
            </Button>
            <Button onClick={() => setIsAddEventOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>
      </motion.div>

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
                  Today, {format(today, 'EEEE, MMMM d')}
                </h3>
                
                {todaysEvents.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    No events scheduled for today
                  </p>
                ) : (
                  <div className="divide-y">
                    {todaysEvents.map((event) => {
                      const category = categories.find(c => c.id === event.categoryId);
                      return (
                        <div 
                          key={event.id} 
                          className="py-3 flex items-start space-x-3"
                        >
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
                  <Link href="/calendar">
                    View Full Calendar
                  </Link>
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
                  <Link href="/tasks">
                    View All Tasks
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </Tabs>
        </motion.div>
      </div>
      
      <AddEventDialog
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
      />
      
      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
      />
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