'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Task, RecurringPattern } from '@/lib/types';
import { toast } from 'sonner';
import { SubtaskList } from './SubtaskList';
import { RecurringTaskSettings } from './RecurringTaskSettings';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.date().optional().nullable(),
  dueDate: z.date().optional().nullable(),
  completed: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']),
  categoryId: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).default([]),
  recurring: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().min(1).default(1),
    endDate: z.date().optional().nullable(),
    occurrences: z.number().optional().nullable(),
    daysOfWeek: z.array(z.number()).optional(),
  }).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export default function TaskDetailDialog({
  open,
  onOpenChange,
  task,
}: TaskDetailDialogProps) {
  const { updateTask, addTask, categories, tags } = useApp();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showProgress, setShowProgress] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const defaultValues: FormValues = {
    title: '',
    description: '',
    date: null,
    dueDate: null,
    completed: false,
    priority: 'medium',
    categoryId: 'none',
    progress: 0,
    tags: [],
    recurring: null,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Reset form when dialog opens or task changes
  useEffect(() => {
    if (open && task) {
      form.reset({
        title: task.title,
        description: task.description || '',
        date: task.date || null,
        dueDate: task.dueDate || null,
        completed: task.completed,
        priority: task.priority,
        categoryId: task.categoryId,
        progress: task.progress,
        tags: task.tags || [],
        recurring: task.recurring || null,
      });
      setSelectedTags(task.tags || []);
      setShowProgress(task.progress !== undefined);
      setShowRecurring(!!task.recurring);
      setShowSubtasks(true);
    } else if (open && !task) {
      form.reset(defaultValues);
      setSelectedTags([]);
      setShowProgress(false);
      setShowRecurring(false);
      setShowSubtasks(false);
    }
  }, [open, task, form]);

  const onSubmit = (data: FormValues) => {
    const taskData: Omit<Task, 'id'> = {
      title: data.title,
      description: data.description,
      date: data.date || undefined,
      dueDate: data.dueDate || undefined,
      completed: data.completed,
      priority: data.priority,
      categoryId: data.categoryId === 'none' ? undefined : data.categoryId,
      tags: selectedTags,
      recurring: showRecurring ? data.recurring as RecurringPattern : undefined,
    };

    if (showProgress) {
      taskData.progress = data.progress;
    }

    if (task) {
      updateTask(task.id, taskData);
      toast.success('Task updated successfully');
    } else {
      addTask(taskData);
      toast.success('Task added successfully');
    }

    onOpenChange(false);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {task ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter task description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="pl-3 text-left font-normal flex justify-start items-center"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recurring Task Settings */}
            <RecurringTaskSettings
              form={form}
              showRecurring={showRecurring}
              setShowRecurring={setShowRecurring}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showProgress"
                checked={showProgress}
                onCheckedChange={(checked) => setShowProgress(!!checked)}
              />
              <label
                htmlFor="showProgress"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Track progress for this task
              </label>
            </div>

            {showProgress && (
              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-1">
                      <FormLabel>Progress ({field.value}%)</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value || 0]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div>
              <FormLabel>Tags</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {tags.length === 0 && (
                  <div className="text-sm text-muted-foreground">No tags available</div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="completed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Mark as completed
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showSubtasks"
                checked={showSubtasks}
                onCheckedChange={(checked) => setShowSubtasks(!!checked)}
              />
              <label
                htmlFor="showSubtasks"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Add subtasks
              </label>
            </div>

            {showSubtasks && (
              <div className="border rounded-md p-4 bg-muted/10">
                <h3 className="text-sm font-medium mb-2">Subtasks</h3>
                {task ? (
                  <SubtaskList parentId={task.id} />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    You can add subtasks after creating the task.
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button type="submit">
                {task ? 'Save Changes' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        
        {/* Subtasks (only for existing tasks) */}
        {task && !showSubtasks && (
          <div className="mt-6 pt-6 border-t">
            <SubtaskList parentId={task.id} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 