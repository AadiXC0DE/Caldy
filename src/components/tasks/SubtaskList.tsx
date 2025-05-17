'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Task, Priority } from '@/lib/types';
import { Plus, Trash2, GripVertical, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, Reorder, motion } from 'framer-motion';

interface SubtaskListProps {
  parentId: string;
}

export function SubtaskList({ parentId }: SubtaskListProps) {
  const { getSubtasks, addSubtask, updateTask, completeTask, deleteTask, reorderTasks } = useApp();
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskPriority, setNewSubtaskPriority] = useState<Priority>('medium');
  const subtasks = getSubtasks(parentId);
  const [subtaskOrder, setSubtaskOrder] = useState(() => subtasks.map(task => task.id));
  const [isReordering, setIsReordering] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  const [editingSubtaskPriority, setEditingSubtaskPriority] = useState<Priority>('medium');

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    
    addSubtask(parentId, {
      title: newSubtaskTitle,
      completed: false,
      priority: newSubtaskPriority,
    });
    
    setNewSubtaskTitle('');
    setNewSubtaskPriority('medium');
  };
  
  const handleCompleteSubtask = (id: string, completed: boolean) => {
    completeTask(id, completed);
  };
  
  const handleDeleteSubtask = (id: string) => {
    deleteTask(id);
  };
  
  const handleReorder = (newOrder: string[]) => {
    setSubtaskOrder(newOrder);
    reorderTasks(newOrder);
  };
  
  // Sort subtasks by order property if defined, otherwise by their ID order
  const sortedSubtasks = [...subtasks].sort((a, b) => {
    // Use explicit order if available
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    
    // Otherwise use the order from subtaskOrder array
    return subtaskOrder.indexOf(a.id) - subtaskOrder.indexOf(b.id);
  });
  
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

  const handleStartEdit = (subtask: Task) => {
    setEditingSubtaskId(subtask.id);
    setEditingSubtaskTitle(subtask.title);
    setEditingSubtaskPriority(subtask.priority);
  };

  const handleSaveEdit = () => {
    if (editingSubtaskId && editingSubtaskTitle.trim()) {
      updateTask(editingSubtaskId, {
        title: editingSubtaskTitle,
        priority: editingSubtaskPriority
      });
      setEditingSubtaskId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingSubtaskId(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Subtasks</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsReordering(!isReordering)}
        >
          {isReordering ? 'Done' : 'Reorder'}
        </Button>
      </div>
      
      <div className="space-y-2">
        {isReordering ? (
          // Reorderable list
          <Reorder.Group
            axis="y"
            values={subtaskOrder}
            onReorder={handleReorder}
            className="space-y-2"
          >
            {sortedSubtasks.map((subtask) => (
              <Reorder.Item
                key={subtask.id}
                value={subtask.id}
                className="flex items-center gap-2 p-2 border rounded-md bg-card"
              >
                <div className="flex items-center justify-center w-8 h-8 cursor-move">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-grow flex items-center">
                  <span className={`ml-2 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {subtask.title}
                  </span>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          // Regular list
          <AnimatePresence initial={false}>
            {sortedSubtasks.map((subtask) => (
              <motion.div
                key={subtask.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-2 border rounded-md bg-card"
              >
                {editingSubtaskId === subtask.id ? (
                  // Editing mode
                  <>
                    <div className="flex-grow flex items-center gap-2">
                      <Input
                        value={editingSubtaskTitle}
                        onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                        className="h-8"
                        autoFocus
                      />
                      <Select
                        value={editingSubtaskPriority}
                        onValueChange={(value) => setEditingSubtaskPriority(value as Priority)}
                      >
                        <SelectTrigger className="w-[100px] h-8">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSaveEdit}
                      className="h-8 w-8"
                    >
                      <Save className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCancelEdit}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </>
                ) : (
                  // Display mode
                  <>
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={(checked) => 
                        handleCompleteSubtask(subtask.id, checked as boolean)
                      }
                      className={subtask.completed ? '' : getPriorityColor(subtask.priority)}
                    />
                    <span className={`flex-grow ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {subtask.title}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {subtask.priority.charAt(0).toUpperCase() + subtask.priority.slice(1)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStartEdit(subtask)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {/* Form to add new subtask */}
        <div className="flex items-center gap-2 mt-2">
          <Input
            placeholder="Add a subtask..."
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddSubtask();
              }
            }}
            className="flex-grow"
          />
          <Select
            value={newSubtaskPriority}
            onValueChange={(value) => setNewSubtaskPriority(value as Priority)}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddSubtask}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 