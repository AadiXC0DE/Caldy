'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, Moon, Sun, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function FocusPageClient() {
  const { tasks, pomodoroSettings, updateTaskTimeTracking } = useApp();
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'break' | 'long-break'>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [isAmbient, setIsAmbient] = useState(false);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const incompleteTasks = tasks.filter((t) => !t.completed && !t.isTemplate);

  const getSessionDuration = useCallback(
    (type: 'work' | 'break' | 'long-break') => {
      switch (type) {
        case 'work':
          return pomodoroSettings.workMinutes * 60;
        case 'break':
          return pomodoroSettings.breakMinutes * 60;
        case 'long-break':
          return pomodoroSettings.longBreakMinutes * 60;
      }
    },
    [pomodoroSettings],
  );

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSessionEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const handleSessionEnd = useCallback(() => {
    setIsRunning(false);

    if (sessionType === 'work') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      setTotalFocusMinutes((prev) => prev + pomodoroSettings.workMinutes);

      // Save time tracking to selected task
      if (selectedTaskId) {
        const task = tasks.find((t) => t.id === selectedTaskId);
        if (task) {
          const currentMinutes = task.timeTracking?.actualMinutes || 0;
          updateTaskTimeTracking(selectedTaskId, {
            actualMinutes: currentMinutes + pomodoroSettings.workMinutes,
            pomodoroCount: (task.timeTracking?.pomodoroCount || 0) + 1,
            sessions: [
              ...(task.timeTracking?.sessions || []),
              { date: new Date(), durationMinutes: pomodoroSettings.workMinutes, type: 'work' },
            ],
          });
        }
      }

      // Determine next session
      if (newCount % pomodoroSettings.longBreakInterval === 0) {
        setSessionType('long-break');
        setTimeLeft(pomodoroSettings.longBreakMinutes * 60);
      } else {
        setSessionType('break');
        setTimeLeft(pomodoroSettings.breakMinutes * 60);
      }
    } else {
      setSessionType('work');
      setTimeLeft(pomodoroSettings.workMinutes * 60);
    }
  }, [
    sessionType,
    completedPomodoros,
    pomodoroSettings,
    selectedTaskId,
    tasks,
    updateTaskTimeTracking,
  ]);

  const toggleTimer = () => {
    if (!isRunning) {
      startTimeRef.current = new Date();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSessionType('work');
    setTimeLeft(pomodoroSettings.workMinutes * 60);
    setCompletedPomodoros(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const skipSession = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    handleSessionEnd();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = 1 - timeLeft / getSessionDuration(sessionType);
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference * (1 - progress);

  const sessionColors = {
    work: {
      ring: 'stroke-primary',
      bg: 'bg-primary/10',
      text: 'text-primary',
      label: 'Focus Time',
    },
    break: {
      ring: 'stroke-green-500',
      bg: 'bg-green-500/10',
      text: 'text-green-500',
      label: 'Short Break',
    },
    'long-break': {
      ring: 'stroke-blue-500',
      bg: 'bg-blue-500/10',
      text: 'text-blue-500',
      label: 'Long Break',
    },
  };

  const currentSession = sessionColors[sessionType];

  return (
    <div
      className={`container mx-auto max-w-4xl px-4 transition-all duration-700 ${isAmbient ? 'opacity-90' : ''}`}
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Timer className="h-8 w-8 mr-2 text-primary" />
              Focus Mode
            </h1>
            <p className="text-muted-foreground mt-1">Deep work with Pomodoro technique</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsAmbient(!isAmbient)}
            className="rounded-full"
            title={isAmbient ? 'Exit ambient mode' : 'Enter ambient mode'}
          >
            {isAmbient ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Timer Column */}
        <div className="md:col-span-2">
          <Card
            className={`border-0 shadow-xl ${currentSession.bg} transition-colors duration-500`}
          >
            <CardContent className="flex flex-col items-center py-12">
              {/* Session Label */}
              <motion.div
                key={sessionType}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 mb-8 px-4 py-2 rounded-full ${currentSession.bg} border`}
              >
                {sessionType === 'work' ? (
                  <Brain className="h-4 w-4" />
                ) : (
                  <Coffee className="h-4 w-4" />
                )}
                <span className="font-medium text-sm">{currentSession.label}</span>
              </motion.div>

              {/* Circular Timer */}
              <div className="relative w-72 h-72 md:w-80 md:h-80">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 300 300">
                  {/* Track */}
                  <circle
                    cx="150"
                    cy="150"
                    r="140"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-muted/20"
                  />
                  {/* Progress */}
                  <motion.circle
                    cx="150"
                    cy="150"
                    r="140"
                    fill="none"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className={currentSession.ring}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    initial={false}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.5, ease: 'linear' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    key={timeLeft}
                    className="text-6xl md:text-7xl font-mono font-bold tracking-tight"
                  >
                    {formatTime(timeLeft)}
                  </motion.span>
                  <span className="text-muted-foreground text-sm mt-2">
                    {completedPomodoros > 0 &&
                      `${completedPomodoros} pomodoro${completedPomodoros !== 1 ? 's' : ''} done`}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetTimer}
                  className="rounded-full h-12 w-12"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <Button
                  onClick={toggleTimer}
                  size="lg"
                  className="rounded-full h-16 w-16 shadow-lg"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isRunning ? 'pause' : 'play'}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {isRunning ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6 ml-0.5" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={skipSession}
                  className="rounded-full h-12 w-12"
                  title="Skip session"
                >
                  <Zap className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Task Selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Link to Task</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a task..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No task</SelectItem>
                  {incompleteTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Session Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Today&apos;s Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pomodoros</span>
                <span className="font-bold text-lg">{completedPomodoros}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Focus Time</span>
                <span className="font-bold text-lg">{totalFocusMinutes}m</span>
              </div>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${
                      i < completedPomodoros ? 'bg-primary' : 'bg-muted'
                    }`}
                    initial={false}
                    animate={{
                      scale: i < completedPomodoros ? 1 : 0.8,
                      opacity: i < completedPomodoros ? 1 : 0.3,
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timer Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Timer Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Work</span>
                <span>{pomodoroSettings.workMinutes}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Short Break</span>
                <span>{pomodoroSettings.breakMinutes}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Long Break</span>
                <span>{pomodoroSettings.longBreakMinutes}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Long Break After</span>
                <span>{pomodoroSettings.longBreakInterval} sessions</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function FocusPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-4">
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <FocusPageClient />
    </Suspense>
  );
}
