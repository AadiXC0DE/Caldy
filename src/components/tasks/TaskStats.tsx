'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { CheckSquare, Trash2, BarChart3, ChevronUp, ChevronDown } from 'lucide-react';

// Chart configurations
const statusChartConfig = {
  completed: {
    label: "Completed",
    color: "#10b981",
  },
  incomplete: {
    label: "Incomplete",
    color: "#ef4444",
  },
} satisfies ChartConfig;

const priorityChartConfig = {
  high: {
    label: "High",
    color: "#ef4444",
  },
  medium: {
    label: "Medium",
    color: "#f59e0b",
  },
  low: {
    label: "Low",
    color: "#10b981",
  },
} satisfies ChartConfig;

const categoryChartConfig = {
  work: {
    label: "Work",
    color: "#4F46E5",
  },
  personal: {
    label: "Personal",
    color: "#10B981",
  },
  health: {
    label: "Health",
    color: "#EF4444",
  },
  finance: {
    label: "Finance",
    color: "#F59E0B",
  },
  education: {
    label: "Education",
    color: "#8B5CF6",
  },
} satisfies ChartConfig;

const weeklyChartConfig = {
  completed: {
    label: "Completed",
    color: "#10b981",
  },
  due: {
    label: "Due",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

export function TaskStats() {
  const { tasks, categories, batchUpdateTasks, deleteTask } = useApp();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(true);

  // Prepare data for status chart (completed vs incomplete)
  const statusData = useMemo(() => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const incompleteTasks = tasks.filter(task => !task.completed).length;

    return [
      {
        name: 'Completed',
        value: completedTasks,
        fill: statusChartConfig.completed.color
      },
      {
        name: 'Incomplete',
        value: incompleteTasks,
        fill: statusChartConfig.incomplete.color
      }
    ];
  }, [tasks]);

  // Prepare data for priority chart
  const priorityData = useMemo(() => {
    const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
    const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
    const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;

    return [
      {
        name: 'High',
        value: highPriorityTasks,
        fill: priorityChartConfig.high.color
      },
      {
        name: 'Medium',
        value: mediumPriorityTasks,
        fill: priorityChartConfig.medium.color
      },
      {
        name: 'Low',
        value: lowPriorityTasks,
        fill: priorityChartConfig.low.color
      }
    ];
  }, [tasks]);

  // Prepare data for category distribution chart
  const categoryData = useMemo(() => {
    const categoryCounts = categories.map(category => {
      const taskCount = tasks.filter(task => task.categoryId === category.id).length;

      return {
        name: category.name,
        value: taskCount,
        fill: category.color
      };
    }).filter(cat => cat.value > 0); // Only include categories with tasks

    return categoryCounts;
  }, [tasks, categories]);

  // Prepare data for weekly completion trends
  const weeklyTrendsData = useMemo(() => {
    // Get start and end of current week
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start on Monday
    const endDate = endOfWeek(new Date(), { weekStartsOn: 1 });

    // Generate array of days in the week
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Count tasks completed on each day of the week
    const completedByDay = days.map(day => {
      const dayString = format(day, 'yyyy-MM-dd');
      return tasks.filter(task => {
        return task.completed &&
          task.date &&
          format(new Date(task.date), 'yyyy-MM-dd') === dayString;
      }).length;
    });

    // Count tasks due on each day of the week
    const dueByDay = days.map(day => {
      const dayString = format(day, 'yyyy-MM-dd');
      return tasks.filter(task => {
        return task.dueDate &&
          format(new Date(task.dueDate), 'yyyy-MM-dd') === dayString;
      }).length;
    });

    return days.map((day, index) => ({
      name: format(day, 'EEE'), // Mon, Tue, etc.
      completed: completedByDay[index],
      due: dueByDay[index]
    }));
  }, [tasks]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;

    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  }, [tasks]);

  const handleSelectAll = () => {
    const allTaskIds = tasks.map(task => task.id);
    setSelectedTasks(selectedTasks.length === allTaskIds.length ? [] : allTaskIds);
  };

  const handleBatchComplete = () => {
    if (selectedTasks.length > 0) {
      batchUpdateTasks(selectedTasks, { completed: true });
      setSelectedTasks([]);
    }
  };

  const handleBatchDelete = () => {
    if (selectedTasks.length > 0) {
      selectedTasks.forEach(id => {
        deleteTask(id);
      });
      setSelectedTasks([]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl font-bold flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Task Statistics
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 px-2 gap-1"
              title={isMinimized ? "Expand statistics" : "Collapse statistics"}
              aria-label={isMinimized ? "Expand task statistics section" : "Collapse task statistics section"}
            >
              {isMinimized ? (
                <>
                  <span className="text-xs">Expand</span>
                  <ChevronDown className="h-3 w-3" />
                </>
              ) : (
                <>
                  <span className="text-xs">Collapse</span>
                  <ChevronUp className="h-3 w-3" />
                </>
              )}
            </Button>
          </div>
          {selectedTasks.length > 0 && !isMinimized && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedTasks.length} selected</Badge>
              <Button size="sm" onClick={handleBatchComplete}>
                <CheckSquare className="h-4 w-4 mr-1" />
                Complete Selected
              </Button>
              <Button size="sm" variant="destructive" onClick={handleBatchDelete}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      {!isMinimized && (
        <CardContent>
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium mb-2">Overall Progress</h3>
          <div className="text-3xl font-bold text-primary mb-1">
            {overallProgress}%
          </div>
          <div className="text-sm text-muted-foreground">
            {tasks.filter(task => task.completed).length} of {tasks.length} tasks completed
          </div>
          <div className="w-full bg-muted rounded-full h-3 mt-2">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="priority">Priority</TabsTrigger>
            <TabsTrigger value="category">Category</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="mt-6">
            <ChartContainer config={statusChartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  isAnimationActive={false}
                />
                  <ChartLegend verticalAlign="bottom" align="center" />
              </PieChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="priority" className="mt-6">
            <ChartContainer config={priorityChartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  isAnimationActive={false}
                />
                  <ChartLegend verticalAlign="bottom" align="center" />
              </PieChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="category" className="mt-6">
            <ChartContainer config={categoryChartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  isAnimationActive={false}
                />
                  <ChartLegend verticalAlign="bottom" align="center" />
              </PieChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <ChartContainer config={weeklyChartConfig} className="h-[300px]">
              <BarChart data={weeklyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  isAnimationActive={false}
                />
                  <ChartLegend verticalAlign="bottom" align="center" />
                <Bar dataKey="completed" fill={weeklyChartConfig.completed.color} name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="due" fill={weeklyChartConfig.due.color} name="Due" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
        </CardContent>
      )}
    </Card>
  );
} 