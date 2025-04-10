'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { CheckSquare, PlusCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TaskList from '@/components/tasks/TaskList';
import AddTaskDialog from '@/components/tasks/AddTaskDialog';
import { Priority } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import TaskDetailDialog from '@/components/tasks/TaskDetailDialog';

export default function TasksPage() {
  const { tasks, categories } = useApp();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'completed' | 'incomplete'>('all');
  const searchParams = useSearchParams();
  const taskId = searchParams.get('task');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

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

  const headerSection = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <CheckSquare className="h-8 w-8 mr-2 text-primary" />
            Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your tasks and track your progress
          </p>
        </div>

        <Button onClick={handleAddTaskOpen}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>
    </motion.div>
  ), [handleAddTaskOpen]);

  const filtersSection = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-col sm:flex-row gap-4"
    >
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search tasks..." 
          className="pl-9"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-2">
        <Select value={filterPriority} onValueChange={handlePriorityChange}>
          <SelectTrigger className="w-full sm:w-32">
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
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categorySelectItems}
          </SelectContent>
        </Select>
        
        <Select value={filterCompleted} onValueChange={handleCompletedChange}>
          <SelectTrigger className="w-full col-span-2 sm:col-span-1 sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="incomplete">Incomplete</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  ), [
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

  useEffect(() => {
    if (taskId) {
      setSelectedTaskId(taskId);
      setIsAddTaskOpen(false);
    }
  }, [taskId]);

  const taskToShow = tasks.find(task => task.id === selectedTaskId) || null;

  return (
    <div className="space-y-4">
      {headerSection}
      {filtersSection}
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
    </div>
  );
} 