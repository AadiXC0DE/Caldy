'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Task, Priority } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  Circle, 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Clock,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import TaskDetailDialog from './TaskDetailDialog';

// A helper function to get the priority color class
const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-amber-500';
    case 'low':
      return 'text-green-500';
    default:
      return '';
  }
};

const getPriorityBadgeVariant = (priority: Priority): "default" | "destructive" | "outline" | "secondary" => {
  switch (priority) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'outline';
  }
};

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const { completeTask, deleteTask, categories, tags, updateTaskProgress } = useApp();
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Add this effect to handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sort tasks: incomplete first, then by due date, then by priority
  const sortedTasks = [...tasks].sort((a, b) => {
    // Completed tasks go to the bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then sort by due date (if available)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    
    // Then sort by priority (high to low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const toggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleCompleteTask = (taskId: string, isComplete: boolean) => {
    completeTask(taskId, isComplete);
    toast.success(isComplete ? 'Task completed!' : 'Task marked as incomplete');
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    toast.success('Task deleted');
  };

  const handleOpenDetails = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleProgressChange = (taskId: string, progress: number) => {
    updateTaskProgress(taskId, progress);
  };

  const getCategoryColor = (categoryId?: string) => {
    if (!categoryId) return undefined;
    const category = categories.find(c => c.id === categoryId);
    return category?.color;
  };

  // If not mounted (server-side or initial render), show a loading state
  if (!mounted) {
    return (
      <div className="py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-muted rounded-full"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="ml-auto w-16 h-6 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Client-side rendering with empty state
  if (tasks.length === 0) {
    return (
      <div className="py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-muted-foreground/40" />
          </div>
          <h3 className="text-xl font-medium">No tasks found</h3>
          <p className="text-muted-foreground">
            Create a new task to get started or try a different filter.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="divide-y">
      <AnimatePresence>
        {sortedTasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            transition={{ duration: 0.2 }}
            className={`py-3 px-4 ${task.completed ? 'bg-muted/30' : ''}`}
          >
            <Collapsible
              open={expandedTasks[task.id]}
              onOpenChange={() => toggleExpanded(task.id)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Checkbox 
                    checked={task.completed}
                    onCheckedChange={(checked) => 
                      handleCompleteTask(task.id, checked as boolean)
                    }
                    className={`h-5 w-5 ${task.completed ? '' : getPriorityColor(task.priority)}`}
                  />
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <h3 
                        className={`text-base font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                        onClick={() => handleOpenDetails(task)}
                      >
                        {task.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 mt-1">
                        {task.dueDate && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </div>
                        )}
                        
                        {task.categoryId && (
                          <div 
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: `${getCategoryColor(task.categoryId)}20`,
                              color: getCategoryColor(task.categoryId)
                            }}
                          >
                            {categories.find(c => c.id === task.categoryId)?.name}
                          </div>
                        )}
                        
                        <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs">
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {expandedTasks[task.id] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                </div>
              </div>
              
              <CollapsibleContent>
                <div className="pl-8 pt-2 space-y-3">
                  {task.description && (
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                  
                  {task.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                  )}
                  
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map(tagId => {
                        const tag = tags.find(t => t.id === tagId);
                        return tag ? (
                          <Badge key={tagId} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                  
                  <div className="flex justify-end pt-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8"
                      onClick={() => handleOpenDetails(task)}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="h-8"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </motion.div>
        ))}
      </AnimatePresence>
      
      <TaskDetailDialog 
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        task={selectedTask}
      />
    </div>
  );
} 