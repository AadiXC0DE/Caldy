'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Task, Priority } from '@/lib/types';
import { 
  Copy, 
  Clipboard, 
  Star, 
  MoreHorizontal, 
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

export function TaskTemplates() {
  const { 
    tasks, 
    categories, 
    createTaskFromTemplate, 
    toggleTaskTemplate, 
    batchUpdateTasks
  } = useApp();
  
  const templates = tasks.filter(task => task.isTemplate);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [batchCategory, setBatchCategory] = useState<string | undefined>(undefined);
  const [batchPriority, setBatchPriority] = useState<Priority | undefined>(undefined);
  const [batchComplete, setBatchComplete] = useState<boolean | undefined>(undefined);
  
  // Toggle selection of a task
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId) 
        : [...prev, taskId]
    );
  };
  
  // Toggle all tasks selection
  const toggleAllSelection = () => {
    if (selectedTaskIds.length === tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map(task => task.id));
    }
  };
  
  // Create a task from template
  const handleCreateFromTemplate = (templateId: string) => {
    const newTaskId = createTaskFromTemplate(templateId);
    if (newTaskId && newTaskId.length > 0) {
      toast.success('Task created from template');
    }
  };
  
  // Convert a regular task to template
  const handleConvertToTemplate = (taskId: string) => {
    toggleTaskTemplate(taskId);
    toast.success('Task converted to template');
  };
  
  // Apply batch updates to selected tasks
  const handleBatchUpdate = () => {
    const updates: Partial<Task> = {};
    
    if (batchCategory !== undefined) {
      updates.categoryId = batchCategory === 'none' ? undefined : batchCategory;
    }
    
    if (batchPriority !== undefined) {
      updates.priority = batchPriority;
    }
    
    if (batchComplete !== undefined) {
      updates.completed = batchComplete;
    }
    
    batchUpdateTasks(selectedTaskIds, updates);
    setBatchDialogOpen(false);
    setIsSelectMode(false);
    setSelectedTaskIds([]);
    
    toast.success(`Updated ${selectedTaskIds.length} tasks`);
  };
  
  // Get color for priority badge
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
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Task Management</CardTitle>
            <CardDescription>Templates and batch actions</CardDescription>
          </div>
          <Button
            variant={isSelectMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              if (!isSelectMode) {
                setSelectedTaskIds([]);
              }
            }}
          >
            {isSelectMode ? 'Cancel' : 'Select Tasks'}
          </Button>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="templates">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="batch">Batch Actions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4">
          <CardContent className="p-4">
            {templates.length === 0 ? (
              <div className="text-center py-6">
                <Star className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <h3 className="text-lg font-medium mb-1">No templates yet</h3>
                <p className="text-sm text-muted-foreground">
                  Convert existing tasks to templates for quick reuse
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map(template => (
                  <div key={template.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                    <div>
                      <h4 className="font-medium">{template.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getPriorityBadgeVariant(template.priority)}>
                          {template.priority}
                        </Badge>
                        
                        {template.categoryId && (
                          <Badge variant="outline">
                            {categories.find(c => c.id === template.categoryId)?.name || 'Category'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCreateFromTemplate(template.id)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Tip: Select a task and convert it to a template for future use
            </p>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="batch">
          <CardContent className="p-4">
            {isSelectMode ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={selectedTaskIds.length > 0 && selectedTaskIds.length === tasks.length}
                      onCheckedChange={toggleAllSelection}
                    />
                    <span>
                      {selectedTaskIds.length} of {tasks.length} selected
                    </span>
                  </div>
                  
                  {selectedTaskIds.length > 0 && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setBatchDialogOpen(true)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Apply Changes
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {tasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`flex items-center justify-between p-3 border rounded-md ${
                        selectedTaskIds.includes(task.id) ? 'bg-primary/10 border-primary/30' : 'bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-grow">
                        <Checkbox 
                          checked={selectedTaskIds.includes(task.id)}
                          onCheckedChange={() => toggleTaskSelection(task.id)}
                        />
                        <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                          {task.title}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityBadgeVariant(task.priority)}>
                          {task.priority}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleConvertToTemplate(task.id)}>
                              <Star className="h-4 w-4 mr-2" />
                              Convert to template
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Clipboard className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <h3 className="text-lg font-medium mb-1">Batch Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Select multiple tasks to update them at once
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsSelectMode(true)}
                >
                  Select Tasks
                </Button>
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update {selectedTaskIds.length} Tasks</DialogTitle>
            <DialogDescription>
              Choose which properties to update for the selected tasks
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Category</p>
              <Select 
                value={batchCategory} 
                onValueChange={setBatchCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No change" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Priority</p>
              <Select 
                value={batchPriority} 
                onValueChange={(value) => setBatchPriority(value as Priority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No change" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <Select 
                value={batchComplete?.toString()} 
                onValueChange={(value) => 
                  setBatchComplete(value === 'undefined' ? undefined : value === 'true')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No change" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Mark as completed</SelectItem>
                  <SelectItem value="false">Mark as incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBatchUpdate}>
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 