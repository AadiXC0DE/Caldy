'use client';

import React, { useState, useMemo, Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Plus, Trash2, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subDays } from 'date-fns';
import { PageHeader } from '@/components/layout/PageHeader';

const HABIT_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

const HABIT_ICONS = ['💪', '📚', '🏃', '💧', '🧘', '✍️', '🎯', '💤'];

function getStreakCount(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const sorted = [...completedDates].sort().reverse();

  // Must include today or yesterday to have a streak
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const expected = format(subDays(new Date(sorted[0]), i), 'yyyy-MM-dd');
    if (sorted[i] === expected) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function HabitsPageClient() {
  const { habits, addHabit, deleteHabit, toggleHabitDate } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(HABIT_COLORS[0]);
  const [newIcon, setNewIcon] = useState(HABIT_ICONS[0]);
  const quickCreateHandledRef = useRef(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const newItem = searchParams.get('new');

  useEffect(() => {
    if (newItem === 'habit' && !quickCreateHandledRef.current) {
      quickCreateHandledRef.current = true;
      setIsDialogOpen(true);
      router.replace('/habits');
      return;
    }

    if (newItem !== 'habit') {
      quickCreateHandledRef.current = false;
    }
  }, [newItem, router]);

  // Generate heatmap data (last 91 days / 13 weeks)
  const heatmapDays = useMemo(() => {
    const days: { date: string; counts: Record<string, boolean> }[] = [];
    for (let i = 90; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const counts: Record<string, boolean> = {};
      habits.forEach((h) => {
        counts[h.id] = h.completedDates.includes(date);
      });
      days.push({ date, counts });
    }
    return days;
  }, [habits]);

  const handleAddHabit = () => {
    if (!newName.trim()) return;
    addHabit({ name: newName, color: newColor, icon: newIcon, frequency: 'daily' });
    setNewName('');
    setNewColor(HABIT_COLORS[0]);
    setNewIcon(HABIT_ICONS[0]);
    setIsDialogOpen(false);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4">
      <PageHeader
        title="Habits"
        description={`${habits.length} tracked habit${habits.length === 1 ? '' : 's'} ready for today’s check-in.`}
        icon={Flame}
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-sm">
                <Plus className="h-4 w-4" />
                New Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Habit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Name</label>
                  <Input
                    placeholder="e.g. Drink 8 glasses of water"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {HABIT_ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewIcon(icon)}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-xl transition-all ${
                          newIcon === icon
                            ? 'border-primary bg-primary/10 scale-110'
                            : 'border-transparent hover:bg-muted'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {HABIT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewColor(color)}
                        className={`h-8 w-8 rounded-full transition-all ${
                          newColor === color ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddHabit} className="w-full" disabled={!newName.trim()}>
                  Create Habit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {habits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <Flame className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">No habits yet</h3>
          <p className="text-muted-foreground mb-4">
            Start tracking your daily habits to build streaks!
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Habit
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Today's Habits */}
          <div className="grid gap-3">
            <AnimatePresence>
              {habits.map((habit, index) => {
                const isCompletedToday = habit.completedDates.includes(todayStr);
                const streak = getStreakCount(habit.completedDates);

                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`transition-all ${isCompletedToday ? 'border-green-500/30 bg-green-500/5' : ''}`}
                    >
                      <CardContent className="flex items-center justify-between py-4 px-5">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleHabitDate(habit.id, todayStr)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              isCompletedToday
                                ? 'bg-green-500 text-white shadow-md scale-105'
                                : 'border-2 hover:border-green-500/50'
                            }`}
                            style={{
                              borderColor: isCompletedToday ? undefined : habit.color + '40',
                            }}
                          >
                            {isCompletedToday ? (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <Check className="h-5 w-5" />
                              </motion.div>
                            ) : (
                              <span className="text-lg">{habit.icon}</span>
                            )}
                          </button>
                          <div>
                            <h3
                              className={`font-medium ${isCompletedToday ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {habit.name}
                            </h3>
                            {streak > 0 && (
                              <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
                                🔥 {streak} day streak
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteHabit(habit.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Heatmap */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Activity Heatmap</CardTitle>
              <CardDescription>See how consistent your habits have been over the last 13 weeks.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div
                  className="grid grid-flow-col gap-1"
                  style={{ gridTemplateRows: 'repeat(7, 1fr)' }}
                >
                  {heatmapDays.map((day) => {
                    const completedCount = Object.values(day.counts).filter(Boolean).length;
                    const totalHabits = habits.length;
                    const ratio = totalHabits > 0 ? completedCount / totalHabits : 0;
                    const isToday = day.date === todayStr;

                    return (
                      <motion.div
                        key={day.date}
                        className={`w-3 h-3 rounded-[3px] transition-colors ${isToday ? 'ring-1 ring-primary' : ''}`}
                        style={{
                          backgroundColor:
                            ratio === 0
                              ? 'var(--muted)'
                              : ratio < 0.5
                                ? 'oklch(0.7 0.14 150 / 40%)'
                                : ratio < 1
                                  ? 'oklch(0.6 0.14 150 / 70%)'
                                  : 'oklch(0.5 0.18 150)',
                        }}
                        title={`${day.date}: ${completedCount}/${totalHabits} habits`}
                        whileHover={{ scale: 1.5 }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-0.5">
                  {[0, 0.25, 0.5, 0.75, 1].map((l, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-[3px]"
                      style={{
                        backgroundColor:
                          l === 0
                            ? 'var(--muted)'
                            : l < 0.5
                              ? 'oklch(0.7 0.14 150 / 40%)'
                              : l < 1
                                ? 'oklch(0.6 0.14 150 / 70%)'
                                : 'oklch(0.5 0.18 150)',
                      }}
                    />
                  ))}
                </div>
                <span>More</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function HabitsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-4">
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <HabitsPageClient />
    </Suspense>
  );
}
