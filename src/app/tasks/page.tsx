'use client';

import React, { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { CheckSquare, PlusCircle, Search, Filter, BarChart3, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Priority } from '@/lib/types';
import TaskList from '@/components/tasks/TaskList';
import AddTaskDialog from '@/components/tasks/AddTaskDialog';
import { useSearchParams } from 'next/navigation';
import TaskDetailDialog from '@/components/tasks/TaskDetailDialog';
import { TaskStats } from '@/components/tasks/TaskStats';
import { TaskTemplates } from '@/components/tasks/TaskTemplates';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { TaskViewsDialog } from '@/components/tasks/TaskViewsDialog';

function TasksPageClient() {
  const { tasks, categories, taskViews, activeTaskView, setActiveTaskView, addTaskView } = useApp();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const taskId = searchParams.get('task');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isViewsDialogOpen, setIsViewsDialogOpen] = useState(false);
  
  const handleAddTaskOpen = useCallback(() => {
    setIsAddTaskOpen(true);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePriorityChange = useCallback((value: string) => {
    setFilterPriority(value as Priority | 'all');
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setFilterCategory(value);
  }, []);

  const handleCompletedChange = useCallback((value: string) => {
    setFilterCompleted(value as 'all' | 'completed' | 'incomplete');
  }, []);
  
  const handleTaskViewChange = useCallback((viewId: string) => {
    setActiveTaskView(viewId);
    // Apply view filters
    const view = taskViews.find(v => v.id === viewId);
    if (view) {
      setSearchTerm(view.filters.searchTerm || '');
      setFilterPriority(view.filters.priority || 'all');
      setFilterCategory(view.filters.category || 'all');
      setFilterCompleted(view.filters.completed || 'all');
    }
  }, [taskViews, setActiveTaskView, mounted]);
  
  const handleSaveCurrentView = useCallback(() => {
    const name = prompt('Enter a name for this view:');
    if (name) {
      addTaskView({
        name,
        filters: {
          searchTerm: searchTerm || undefined,
          priority: filterPriority === 'all' ? undefined : filterPriority,
          category: filterCategory === 'all' ? undefined : filterCategory,
          completed: filterCompleted === 'all' ? undefined : filterCompleted
        },
        sortBy: 'dueDate',
        sortDirection: 'asc'
      });
    }
  }, [addTaskView, searchTerm, filterPriority, filterCategory, filterCompleted, mounted]);

  // Filter tasks based on search term and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search term filter
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      // Priority filter
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      
      // Category filter
      const matchesCategory = filterCategory === 'all' || task.categoryId === filterCategory;
      
      // Completed status filter
      const matchesCompleted = filterCompleted === 'all' || 
        (filterCompleted === 'completed' && task.completed) || 
        (filterCompleted === 'incomplete' && !task.completed);
      
      return matchesSearch && matchesPriority && matchesCategory && matchesCompleted;
    });
  }, [tasks, searchTerm, filterPriority, filterCategory, filterCompleted]);

  // Memoize the category select items to prevent re-rendering when other state changes
  const categorySelectItems = useMemo(() => {
    return categories.map((category) => (
      <SelectItem key={category.id} value={category.id}>
        {category.name}
      </SelectItem>
    ));
  }, [categories]);
  
  const taskViewItems = useMemo(() => {
    return taskViews.map((view) => (
      <DropdownMenuItem key={view.id} onSelect={() => handleTaskViewChange(view.id)}>
        {view.name}
      </DropdownMenuItem>
    ));
  }, [taskViews, handleTaskViewChange, mounted]);

  // Calculate basic stats for the header
  const basicStats = useMemo(() => {
    // During SSR or before mounting, return consistent default values
    if (!mounted || typeof window === 'undefined') {
      return { total: 0, completed: 0, progress: 0 };
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;

    return {
      total: totalTasks,
      completed: completedTasks,
      progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  }, [tasks, mounted]);

  const headerSection = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckSquare className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Tasks</h1>
              <p className="text-muted-foreground">
                Manage and track your tasks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {basicStats.completed}/{basicStats.total}
              </div>
              <div className="text-xs text-muted-foreground">
                completed
              </div>
            </div>
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${basicStats.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <span className="mr-1">
                  {mounted && activeTaskView ?
                    taskViews.find(v => v.id === activeTaskView)?.name || 'All Tasks' :
                    'All Tasks'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => {
                setActiveTaskView(null);
                setFilterPriority('all');
                setFilterCategory('all');
                setFilterCompleted('all');
                setSearchTerm('');
              }}>
                All Tasks
              </DropdownMenuItem>
              {taskViewItems}
              <Separator className="my-1" />
              <DropdownMenuItem onSelect={handleSaveCurrentView}>
                Save current view...
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsViewsDialogOpen(true)}>
                Manage views...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>

          <Button onClick={handleAddTaskOpen}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>
    </motion.div>
  ), [handleAddTaskOpen, taskViewItems, activeTaskView, taskViews, handleSaveCurrentView, setActiveTaskView, setFilterPriority, setFilterCategory, setFilterCompleted, setSearchTerm, showFilters, basicStats, mounted]);

  const filtersSection = useMemo(() => (
    <Collapsible open={showFilters} onOpenChange={setShowFilters}>
      <CollapsibleContent className="mb-6">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                className="pl-9"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <div className="flex gap-2">
              <Select value={filterPriority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categorySelectItems}
                </SelectContent>
              </Select>

              <Select value={filterCompleted} onValueChange={handleCompletedChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  ), [
    showFilters,
    searchTerm,
    handleSearchChange,
    filterPriority,
    handlePriorityChange,
    filterCategory,
    handleCategoryChange,
    filterCompleted,
    handleCompletedChange,
    categorySelectItems
  ]);

  const taskListSection = useMemo(() => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full"
    >
      <Card>
        <CardContent className="p-0 sm:p-1 md:p-2 lg:p-3">
          <TaskList tasks={filteredTasks} />
        </CardContent>
      </Card>
    </motion.div>
  ), [filteredTasks]);
  
  const statsSection = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full mb-6"
    >
      <TaskStats />
    </motion.div>
  ), []);

  useEffect(() => {
    if (taskId) {
      setSelectedTaskId(taskId);
      setIsTaskDetailOpen(true);
    }
  }, [taskId]);

  // Handle client-side mounting to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  const taskToShow = tasks.find(task => task.id === selectedTaskId) || null;

  return (
    <div className="space-y-6">
      {headerSection}
      {filtersSection}
      {statsSection}
      {taskListSection}

      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
      />
      <TaskDetailDialog
        open={isTaskDetailOpen}
        onOpenChange={setIsTaskDetailOpen}
        task={taskToShow}
      />
      <TaskViewsDialog
        open={isViewsDialogOpen}
        onOpenChange={setIsViewsDialogOpen}
        onViewSelected={handleTaskViewChange}
      />
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div>Loading tasks...</div>}>
      <TasksPageClient />
    </Suspense>
  );
} 