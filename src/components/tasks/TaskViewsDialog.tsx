'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { TaskView, Priority } from '@/lib/types';
import { Edit, Trash2, ArrowUp, ArrowDown, Save, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

interface TaskViewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewSelected?: (viewId: string) => void;
}

const viewFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  filterPriority: z.string().optional(),
  filterCategory: z.string().optional(),
  filterCompleted: z.string().optional(),
  sortBy: z.string(),
  sortDirection: z.string(),
});

type ViewFormValues = z.infer<typeof viewFormSchema>;

export function TaskViewsDialog({ open, onOpenChange, onViewSelected }: TaskViewsDialogProps) {
  const { taskViews, addTaskView, updateTaskView, deleteTaskView, categories } = useApp();
  const [editingViewId, setEditingViewId] = useState<string | null>(null);
  
  const defaultValues: ViewFormValues = {
    name: '',
    filterPriority: 'all',
    filterCategory: 'all',
    filterCompleted: 'all',
    sortBy: 'dueDate',
    sortDirection: 'asc',
  };
  
  const form = useForm<ViewFormValues>({
    resolver: zodResolver(viewFormSchema),
    defaultValues,
  });
  
  const onSubmit = (data: ViewFormValues) => {
    // Convert the form data to the TaskView format
    const viewData: Omit<TaskView, 'id'> = {
      name: data.name,
      filters: {
        priority: data.filterPriority === 'all' ? undefined : data.filterPriority as Priority,
        category: data.filterCategory === 'all' ? undefined : data.filterCategory,
        completed: data.filterCompleted === 'all' ? undefined : data.filterCompleted as 'completed' | 'incomplete',
      },
      sortBy: data.sortBy as 'dueDate' | 'priority' | 'title' | 'createdAt' | 'order' | 'progress',
      sortDirection: data.sortDirection as 'asc' | 'desc',
    };
    
    if (editingViewId) {
      updateTaskView(editingViewId, viewData);
      toast.success('View updated successfully');
    } else {
      const newId = addTaskView(viewData);
      toast.success('View created successfully');
      
      // If the consumer provided an onViewSelected callback, call it
      if (onViewSelected) {
        onViewSelected(newId);
      }
    }
    
    // Reset form and editing state
    form.reset(defaultValues);
    setEditingViewId(null);
  };
  
  const handleEditView = (view: TaskView) => {
    setEditingViewId(view.id);
    
    form.reset({
      name: view.name,
      filterPriority: view.filters.priority || 'all',
      filterCategory: view.filters.category || 'all',
      filterCompleted: view.filters.completed || 'all',
      sortBy: view.sortBy,
      sortDirection: view.sortDirection,
    });
  };
  
  const handleDeleteView = (viewId: string) => {
    deleteTaskView(viewId);
    toast.success('View deleted successfully');
    
    // If we were editing this view, reset the form
    if (editingViewId === viewId) {
      form.reset(defaultValues);
      setEditingViewId(null);
    }
  };
  
  const handleSelectView = (viewId: string) => {
    if (onViewSelected) {
      onViewSelected(viewId);
      onOpenChange(false);
    }
  };
  
  const handleCancelEdit = () => {
    form.reset(defaultValues);
    setEditingViewId(null);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Task Views</DialogTitle>
          <DialogDescription>
            Create and manage custom views to quickly filter and sort your tasks
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-5 gap-4">
          {/* List of existing views */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-sm font-medium">Your Views</h3>
            
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {taskViews.length > 0 ? (
                taskViews.map(view => (
                  <Card key={view.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardHeader className="p-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base" onClick={() => handleSelectView(view.id)}>
                          {view.name}
                        </CardTitle>
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7" 
                            onClick={() => handleEditView(view)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive" 
                            onClick={() => handleDeleteView(view.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(view.filters.priority || view.filters.category || view.filters.completed) && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Filter className="h-3 w-3 mr-1" />
                            Filtered
                          </div>
                        )}
                        
                        <div className="flex items-center text-xs text-muted-foreground ml-auto">
                          Sort: {view.sortBy}
                          {view.sortDirection === 'asc' ? (
                            <ArrowUp className="h-3 w-3 ml-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 ml-1" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No custom views yet
                </div>
              )}
            </div>
          </div>
          
          {/* Form to create/edit views */}
          <div className="md:col-span-3 border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-4">
              {editingViewId ? 'Edit View' : 'Create New View'}
            </h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>View Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Custom View" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="filterPriority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority Filter</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="All Priorities" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="filterCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Filter</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="filterCompleted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Filter</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="All Tasks" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Tasks</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="incomplete">Incomplete</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sortBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sort By</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Due Date" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dueDate">Due Date</SelectItem>
                            <SelectItem value="priority">Priority</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                            <SelectItem value="progress">Progress</SelectItem>
                            <SelectItem value="order">Custom Order</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sortDirection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sort Direction</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Ascending" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="asc">Ascending</SelectItem>
                            <SelectItem value="desc">Descending</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter className="mt-6 gap-2">
                  {editingViewId && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {editingViewId ? 'Update View' : 'Save View'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 