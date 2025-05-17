'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export function TaskStats() {
  const { tasks, categories, getSubtasks } = useApp();
  
  // Get all subtasks for statistics
  const allSubtasks = useMemo(() => {
    return tasks.flatMap(task => getSubtasks(task.id));
  }, [tasks, getSubtasks]);
  
  // Prepare data for status chart (completed vs incomplete)
  const statusData = useMemo(() => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const incompleteTasks = tasks.filter(task => !task.completed).length;
    const completedSubtasks = allSubtasks.filter(task => task.completed).length;
    const incompleteSubtasks = allSubtasks.filter(task => !task.completed).length;
    
    return {
      labels: ['Completed', 'Incomplete'],
      datasets: [
        {
          data: [completedTasks + completedSubtasks, incompleteTasks + incompleteSubtasks],
          backgroundColor: [
            'rgba(34, 197, 94, 0.75)',  // Theme green for completed
            'rgba(239, 68, 68, 0.75)',   // Theme red for incomplete
          ],
          borderColor: [
            'rgb(22, 163, 74)',  // Darker theme green
            'rgb(220, 38, 38)',  // Darker theme red
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [tasks, allSubtasks]);
  
  // Prepare data for priority chart
  const priorityData = useMemo(() => {
    const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
    const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
    const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;
    
    const highPrioritySubtasks = allSubtasks.filter(task => task.priority === 'high').length;
    const mediumPrioritySubtasks = allSubtasks.filter(task => task.priority === 'medium').length;
    const lowPrioritySubtasks = allSubtasks.filter(task => task.priority === 'low').length;
    
    return {
      labels: ['High', 'Medium', 'Low'],
      datasets: [
        {
          data: [
            highPriorityTasks + highPrioritySubtasks, 
            mediumPriorityTasks + mediumPrioritySubtasks, 
            lowPriorityTasks + lowPrioritySubtasks
          ],
          backgroundColor: [
            'rgba(239, 68, 68, 0.75)',   // Theme red for high
            'rgba(249, 115, 22, 0.75)',  // Theme orange for medium
            'rgba(34, 197, 94, 0.75)',   // Theme green for low
          ],
          borderColor: [
            'rgb(220, 38, 38)',  // Darker theme red
            'rgb(234, 88, 12)',  // Darker theme orange
            'rgb(22, 163, 74)',  // Darker theme green
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [tasks, allSubtasks]);
  
  // Prepare data for category distribution chart
  const categoryData = useMemo(() => {
    const categoryCounts = categories.map(category => {
      return {
        name: category.name,
        color: category.color,
        count: tasks.filter(task => task.categoryId === category.id).length
      };
    }).filter(cat => cat.count > 0); // Only include categories with tasks
    
    return {
      labels: categoryCounts.map(cat => cat.name),
      datasets: [
        {
          data: categoryCounts.map(cat => cat.count),
          backgroundColor: categoryCounts.map(cat => cat.color + '99'), // Add transparency
          borderColor: categoryCounts.map(cat => cat.color),
          borderWidth: 1,
        },
      ],
    };
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
    
    return {
      labels: days.map(day => format(day, 'EEE')), // Mon, Tue, etc.
      datasets: [
        {
          label: 'Completed',
          data: completedByDay,
          backgroundColor: 'rgba(34, 197, 94, 0.75)', // Theme green
          borderColor: 'rgb(22, 163, 74)', // Darker theme green
          borderWidth: 1,
        },
        {
          label: 'Due',
          data: dueByDay,
          backgroundColor: 'rgba(59, 130, 246, 0.75)', // Theme blue
          borderColor: 'rgb(37, 99, 235)', // Darker theme blue
          borderWidth: 1,
        }
      ],
    };
  }, [tasks]);
  
  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const totalTasks = tasks.length + allSubtasks.length;
    const completedTasks = tasks.filter(task => task.completed).length + 
                          allSubtasks.filter(task => task.completed).length;
    
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  }, [tasks, allSubtasks]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };
  
  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0 // Only show whole numbers
        }
      }
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Task Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium">Overall Progress</h3>
          <div className="text-3xl font-bold mt-2">
            {overallProgress}%
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {tasks.filter(task => task.completed).length + allSubtasks.filter(task => task.completed).length} of {tasks.length + allSubtasks.length} tasks completed
          </div>
        </div>
        
        <Tabs defaultValue="status">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="priority">Priority</TabsTrigger>
            <TabsTrigger value="category">Category</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="h-[300px] mt-6">
            <Doughnut data={statusData} options={chartOptions} />
          </TabsContent>
          
          <TabsContent value="priority" className="h-[300px] mt-6">
            <Doughnut data={priorityData} options={chartOptions} />
          </TabsContent>
          
          <TabsContent value="category" className="h-[300px] mt-6">
            <Doughnut data={categoryData} options={chartOptions} />
          </TabsContent>
          
          <TabsContent value="weekly" className="h-[300px] mt-6">
            <Bar data={weeklyTrendsData} options={barChartOptions} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 