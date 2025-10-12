'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, SkipForward, Settings, RotateCcw } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Task, TimeTracking } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDistanceStrict } from 'date-fns';

interface TaskTimeTrackingProps {
  taskId: string;
  task: Task;
}

export function TaskTimeTracking({ taskId, task }: TaskTimeTrackingProps) {
  const { 
    updateTaskTimeTracking, 
    startTaskTimer, 
    stopTaskTimer, 
    activeTimerTaskId,
    timerStatus,
    timerType,
    timerSessionType,
    pomodoroSettings,
    updatePomodoroSettings
  } = useApp();
  
  const [timeEstimate, setTimeEstimate] = useState(task.timeTracking?.estimatedMinutes || 0);
  const [activeTab, setActiveTab] = useState<'regular' | 'pomodoro'>('regular');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalPomodoros, setTotalPomodoros] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Current timer settings based on session type
  const currentTimerMinutes = timerSessionType === 'work' 
    ? pomodoroSettings.workMinutes 
    : timerSessionType === 'break' 
      ? pomodoroSettings.breakMinutes 
      : pomodoroSettings.longBreakMinutes;
  
  // Initialize from task data
  useEffect(() => {
    setTimeEstimate(task.timeTracking?.estimatedMinutes || 0);
    if (task.timeTracking?.actualMinutes) {
      setElapsedSeconds(task.timeTracking.actualMinutes * 60);
    }
    setTotalPomodoros(task.timeTracking?.pomodoroCount || 0);
  }, [task]);
  
  // Timer logic
  useEffect(() => {
    // Only run timer if this task is the active one
    if (activeTimerTaskId === taskId && timerStatus === 'running') {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        
        // For Pomodoro timer, check if we need to switch sessions
        if (timerType === 'pomodoro') {
          const sessionTotalSeconds = currentTimerMinutes * 60;
          if (elapsedSeconds >= sessionTotalSeconds - 1) { // -1 to account for this tick
            // Session completed
            if (timerSessionType === 'work') {
              // Work session completed
              setTotalPomodoros(prev => prev + 1);
              
              // Determine if we should take a long break
              const completedPomodoros = totalPomodoros + 1;
              if (completedPomodoros % pomodoroSettings.longBreakInterval === 0) {
                // Time for a long break
                // This would typically show a notification and change session type
                // but we'll just log it for now
                console.log('Time for a long break!');
              } else {
                // Regular break
                console.log('Time for a short break!');
              }
            } else {
              // Break session completed
              console.log('Break completed, back to work!');
            }
            
            // Reset timer for next session
            setElapsedSeconds(0);
          }
        }
      }, 1000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [
    activeTimerTaskId, 
    taskId, 
    timerStatus, 
    timerType, 
    timerSessionType, 
    elapsedSeconds, 
    currentTimerMinutes, 
    totalPomodoros, 
    pomodoroSettings
  ]);
  
  // Save timer progress to task when it changes significantly
  useEffect(() => {
    if (elapsedSeconds % 60 === 0 && elapsedSeconds > 0) {
      updateTaskTimeTracking(taskId, {
        actualMinutes: Math.floor(elapsedSeconds / 60),
        pomodoroCount: totalPomodoros
      });
    }
  }, [elapsedSeconds, totalPomodoros, taskId, updateTaskTimeTracking]);
  
  const handleStartTimer = () => {
    startTaskTimer(taskId, activeTab);
  };
  
  const handleStopTimer = () => {
    stopTaskTimer(taskId);
    
    // Save the final time
    updateTaskTimeTracking(taskId, {
      actualMinutes: Math.floor(elapsedSeconds / 60),
      pomodoroCount: totalPomodoros
    });
  };
  
  const handleResetTimer = () => {
    setElapsedSeconds(0);
  };
  
  const handleUpdateEstimate = () => {
    updateTaskTimeTracking(taskId, {
      estimatedMinutes: timeEstimate
    });
  };
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${remainingSeconds}s`;
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (timerType === 'pomodoro') {
      const sessionTotalSeconds = currentTimerMinutes * 60;
      return Math.min(100, (elapsedSeconds / sessionTotalSeconds) * 100);
    } else {
      // For regular timer, show progress against estimate if available
      if (timeEstimate > 0) {
        const estimateSeconds = timeEstimate * 60;
        return Math.min(100, (elapsedSeconds / estimateSeconds) * 100);
      }
      return 0; // No progress bar for unlimited timer
    }
  };
  
  const isActive = activeTimerTaskId === taskId && timerStatus === 'running';
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Time Tracking
        </CardTitle>
        <CardDescription>
          Track time spent on this task
        </CardDescription>
      </CardHeader>
      
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'regular' | 'pomodoro')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="regular">Timer</TabsTrigger>
          <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
        </TabsList>
        
        <TabsContent value="regular" className="space-y-4">
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Time spent:
                </div>
                <div className="font-mono">
                  {formatTime(elapsedSeconds)}
                </div>
              </div>
              
              {timeEstimate > 0 && (
                <div className="space-y-1">
                  <Progress value={calculateProgress()} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0m</span>
                    <span>{timeEstimate}m estimated</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated-time">Estimated time (minutes)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="estimated-time"
                    type="number"
                    min={0}
                    value={timeEstimate}
                    onChange={(e) => setTimeEstimate(Number(e.target.value))}
                    className="flex-grow"
                  />
                  <Button variant="outline" size="sm" onClick={handleUpdateEstimate}>
                    Set
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="pomodoro" className="space-y-4">
          <CardContent className="pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <Badge variant="outline">
                {timerSessionType === 'work' ? 'Work Session' : 
                  timerSessionType === 'break' ? 'Short Break' : 'Long Break'}
              </Badge>
              <Badge>{totalPomodoros} Pomodoros</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-center mb-2">
                <div className="font-mono text-3xl">
                  {formatTime(elapsedSeconds)}
                </div>
              </div>
              
              <div className="space-y-1">
                <Progress value={calculateProgress()} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0m</span>
                  <span>{currentTimerMinutes}m</span>
                </div>
              </div>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Pomodoro Settings
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Timer Settings</h4>
                    <p className="text-sm text-muted-foreground">
                      Customize your Pomodoro timer durations
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="work-minutes">Work</Label>
                      <Input
                        id="work-minutes"
                        type="number"
                        min={1}
                        className="col-span-2"
                        value={pomodoroSettings.workMinutes}
                        onChange={(e) => updatePomodoroSettings({ 
                          workMinutes: Number(e.target.value) 
                        })}
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="break-minutes">Break</Label>
                      <Input
                        id="break-minutes"
                        type="number"
                        min={1}
                        className="col-span-2"
                        value={pomodoroSettings.breakMinutes}
                        onChange={(e) => updatePomodoroSettings({ 
                          breakMinutes: Number(e.target.value) 
                        })}
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="long-break-minutes">Long Break</Label>
                      <Input
                        id="long-break-minutes"
                        type="number"
                        min={1}
                        className="col-span-2"
                        value={pomodoroSettings.longBreakMinutes}
                        onChange={(e) => updatePomodoroSettings({ 
                          longBreakMinutes: Number(e.target.value) 
                        })}
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="long-break-interval">Interval</Label>
                      <Input
                        id="long-break-interval"
                        type="number"
                        min={1}
                        className="col-span-2"
                        value={pomodoroSettings.longBreakInterval}
                        onChange={(e) => updatePomodoroSettings({ 
                          longBreakInterval: Number(e.target.value) 
                        })}
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-between pt-2">
        {isActive ? (
          <Button variant="destructive" onClick={handleStopTimer}>
            <Pause className="h-4 w-4 mr-2" />
            Stop
          </Button>
        ) : (
          <Button variant="default" onClick={handleStartTimer}>
            <Play className="h-4 w-4 mr-2" />
            Start
          </Button>
        )}
        
        <div className="space-x-2">
          {(elapsedSeconds > 0 || totalPomodoros > 0) && (
            <Button variant="outline" size="icon" onClick={handleResetTimer}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          {timerType === 'pomodoro' && (
            <Button variant="outline" size="icon">
              <SkipForward className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 