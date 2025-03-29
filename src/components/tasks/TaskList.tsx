'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Task, Priority } from '@/lib/types';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
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
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

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
    setCompletingTaskId(taskId);
    
    // Delay the actual completion to allow the animation to play
    setTimeout(() => {
      completeTask(taskId, isComplete);
      toast.success(isComplete ? 'Task completed!' : 'Task marked as incomplete');
      // Clear the completing state after animation completes
      setTimeout(() => {
        setCompletingTaskId(null);
      }, 500);
    }, isComplete ? 400 : 0); // Only delay when completing, not when un-completing
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
      <LayoutGroup>
        <AnimatePresence>
          {sortedTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.2 }
              }}
              exit={{ 
                opacity: 0, 
                height: 0, 
                overflow: 'hidden',
                transition: { duration: 0.3 } 
              }}
              layout
              layoutId={task.id}
              className={`py-3 px-4 ${task.completed ? '' : ''} group`}
              whileHover={{ 
                backgroundColor: 'rgba(var(--card-foreground-rgb), 0.03)', 
                transition: { duration: 0.15 } 
              }}
            >
              <Collapsible
                open={expandedTasks[task.id]}
                onOpenChange={() => toggleExpanded(task.id)}
              >
                <div 
                  className="flex items-start gap-3 cursor-pointer relative"
                  onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('.task-checkbox')) {
                      toggleExpanded(task.id);
                    }
                  }}
                >
                  <div className="mt-0.5 task-checkbox" onClick={(e) => e.stopPropagation()}>
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
                        <h3 className="text-base font-medium relative overflow-hidden">
                          <span className={`inline-block relative ${task.completed ? 'text-muted-foreground' : ''}`}>
                            {task.title}
                            
                            {(task.completed || completingTaskId === task.id) && (
                              <motion.span 
                                className="absolute left-0 top-1/2 h-[1.5px] bg-muted-foreground"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ 
                                  duration: task.completed ? 0 : 0.3,
                                  ease: "easeInOut" 
                                }}
                              />
                            )}
                          </span>
                        </h3>
                        
                        <div className="flex flex-wrap items-center mt-1">
                          <div className="flex items-center text-xs text-muted-foreground w-28 mr-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {task.dueDate 
                              ? format(new Date(task.dueDate), 'MMM d, yyyy')
                              : 'No date'}
                          </div>
                          
                          <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs mr-2">
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                          
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
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <motion.div
                          whileHover={{ rotate: expandedTasks[task.id] ? 0 : 90 }}
                          animate={{ rotate: expandedTasks[task.id] ? 180 : 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedTasks[task.id] && (
                    <CollapsibleContent forceMount>
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ 
                          opacity: 1, 
                          height: 'auto',
                          transition: { 
                            height: { duration: 0.3, ease: "easeOut" },
                            opacity: { duration: 0.2, delay: 0.1 }
                          }
                        }}
                        exit={{ 
                          opacity: 0, 
                          height: 0,
                          transition: { 
                            height: { duration: 0.3, ease: "easeIn" },
                            opacity: { duration: 0.2 }
                          }
                        }}
                        className="pt-3 space-y-3 overflow-hidden"
                      >
                        <div className="pl-8">
                          {task.description && (
                            <p className="text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          )}
                          
                          {task.progress !== undefined && (
                            <div className="space-y-1 mt-3">
                              <div className="flex justify-between text-xs">
                                <span>Progress</span>
                                <span>{task.progress}%</span>
                              </div>
                              <Progress value={task.progress} className="h-2" />
                            </div>
                          )}
                          
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
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
                        </div>
                        
                        {/* Improved action buttons layout */}
                        <div className="mt-4 border-t pt-3">
                          <div className="grid grid-cols-2 gap-2 md:flex md:justify-end">
                            <motion.div 
                              whileHover={{ scale: 1.03 }} 
                              whileTap={{ scale: 0.97 }}
                              className="col-span-1 md:w-auto"
                            >
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full md:w-auto md:px-4 bg-background hover:bg-secondary transition-all duration-200"
                                onClick={() => handleOpenDetails(task)}
                              >
                                <Edit className="h-3.5 w-3.5 mr-1.5" />
                                Edit
                              </Button>
                            </motion.div>
                            
                            <motion.div 
                              whileHover={{ scale: 1.03 }} 
                              whileTap={{ scale: 0.97 }}
                              className="col-span-1 md:w-auto md:ml-2"
                            >
                              <Button 
                                variant="destructive" 
                                size="sm"
                                className="w-full md:w-auto md:px-4 hover:bg-red-600 transition-all duration-200"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                Delete
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    </CollapsibleContent>
                  )}
                </AnimatePresence>
              </Collapsible>
            </motion.div>
          ))}
        </AnimatePresence>
      </LayoutGroup>
      
      <TaskDetailDialog 
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        task={selectedTask}
      />
    </div>
  );
} 