'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, addHours } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MapPin, Repeat, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Event } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  allDay: z.boolean().default(false),
  categoryId: z.string().optional(),
  color: z.string().optional(),
  recurring: z.boolean().default(false),
  recurringFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurringInterval: z.coerce.number().min(1).optional(),
  tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  editEvent?: Event;
}

export default function AddEventDialog({ 
  open, 
  onOpenChange, 
  defaultDate = new Date(),
  editEvent,
}: AddEventDialogProps) {
  const { addEvent, updateEvent, deleteEvent, categories} = useApp();
  const [showRecurring, setShowRecurring] = useState(false);

  const defaultValues: FormValues = editEvent ? {
    title: editEvent.title,
    description: editEvent.description || '',
    location: editEvent.location || '',
    startDate: editEvent.start,
    endDate: editEvent.end,
    allDay: editEvent.allDay || false,
    categoryId: editEvent.categoryId,
    color: editEvent.color,
    recurring: !!editEvent.recurring,
    recurringFrequency: editEvent.recurring?.frequency,
    recurringInterval: editEvent.recurring?.interval,
    tags: editEvent.tags || [],
  } : {
    title: '',
    description: '',
    location: '',
    startDate: defaultDate,
    endDate: addHours(defaultDate, 1),
    allDay: false,
    categoryId: undefined,
    color: undefined,
    recurring: false,
    recurringFrequency: undefined,
    recurringInterval: undefined,
    tags: [],
  };

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, editEvent]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const watchAllDay = form.watch('allDay');
  const watchRecurring = form.watch('recurring');

  // Update UI when recurring checkbox changes
  React.useEffect(() => {
    setShowRecurring(watchRecurring);
  }, [watchRecurring]);

  const onSubmit = (data: FormValues) => {
    const eventData: Omit<Event, 'id'> = {
      title: data.title,
      start: data.startDate,
      end: data.endDate,
      allDay: data.allDay,
      description: data.description,
      location: data.location,
      categoryId: data.categoryId,
      color: data.color,
      tags: data.tags,
    };

    if (data.recurring && data.recurringFrequency && data.recurringInterval) {
      eventData.recurring = {
        frequency: data.recurringFrequency,
        interval: data.recurringInterval,
      };
    }

    if (editEvent) {
      updateEvent(editEvent.id, eventData);
      toast.success('Event updated successfully');
    } else {
      addEvent(eventData);
      toast.success('Event added successfully');
    }

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (editEvent) {
      deleteEvent(editEvent.id);
      toast.success('Event deleted successfully');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editEvent ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" {...field} />
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
                    <Textarea placeholder="Enter event description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Location
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start</FormLabel>
                    <div className="grid grid-cols-1 gap-2">
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="pl-3 text-left font-normal flex justify-start items-center overflow-hidden"
                            >
                              <CalendarIcon className="min-w-4 h-4 mr-2" />
                              <span className="truncate">
                                {format(field.value, window.innerWidth < 640 ? 'MMM d, yyyy' : 'PPP')}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => date && field.onChange(date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      
                      {/* Time selection - Redesigned with better theme consistency and improved spacing */}
                      {!watchAllDay && (
                        <div className="flex gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="pl-3 text-left font-normal flex justify-start items-center w-full"
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                {format(field.value, 'h:mm a')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-4" align="start">
                              <div className="grid gap-4">
                                <div className="grid gap-2">
                                  <div className="flex justify-between items-center gap-4">
                                    <Label className="min-w-16">Hours</Label>
                                    <div className="flex items-center border rounded-md">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-r-none"
                                        onClick={() => {
                                          const newDate = new Date(field.value);
                                          const hour = newDate.getHours() === 0 ? 23 : newDate.getHours() - 1;
                                          newDate.setHours(hour);
                                          field.onChange(newDate);
                                        }}
                                      >
                                        <ChevronLeft className="h-4 w-4" />
                                      </Button>
                                      <div className="w-10 text-center">
                                        {format(field.value, 'h')}
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon" 
                                        className="h-8 w-8 rounded-l-none"
                                        onClick={() => {
                                          const newDate = new Date(field.value);
                                          const hour = newDate.getHours() === 23 ? 0 : newDate.getHours() + 1;
                                          newDate.setHours(hour);
                                          field.onChange(newDate);
                                        }}
                                      >
                                        <ChevronRight className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center gap-4">
                                    <Label className="min-w-16">Minutes</Label>
                                    <div className="flex items-center border rounded-md">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-r-none"
                                        onClick={() => {
                                          const newDate = new Date(field.value);
                                          const min = newDate.getMinutes();
                                          const newMin = min < 15 ? 45 : min < 30 ? 0 : min < 45 ? 15 : 30;
                                          newDate.setMinutes(newMin);
                                          field.onChange(newDate);
                                        }}
                                      >
                                        <ChevronLeft className="h-4 w-4" />
                                      </Button>
                                      <div className="w-10 text-center">
                                        {format(field.value, 'mm')}
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-l-none"
                                        onClick={() => {
                                          const newDate = new Date(field.value);
                                          const min = newDate.getMinutes();
                                          const newMin = min < 15 ? 15 : min < 30 ? 30 : min < 45 ? 45 : 0;
                                          newDate.setMinutes(newMin);
                                          field.onChange(newDate);
                                        }}
                                      >
                                        <ChevronRight className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center gap-4">
                                    <Label className="min-w-16">AM/PM</Label>
                                    <div className="flex">
                                      <Button
                                        type="button"
                                        variant={format(field.value, 'a') === 'AM' ? 'default' : 'outline'}
                                        size="sm"
                                        className="rounded-r-none px-3"
                                        onClick={() => {
                                          const newDate = new Date(field.value);
                                          const hour = newDate.getHours();
                                          if (hour >= 12) {
                                            newDate.setHours(hour - 12);
                                          }
                                          field.onChange(newDate);
                                        }}
                                      >
                                        AM
                                      </Button>
                                      <Button
                                        type="button"
                                        variant={format(field.value, 'a') === 'PM' ? 'default' : 'outline'}
                                        size="sm"
                                        className="rounded-l-none px-3"
                                        onClick={() => {
                                          const newDate = new Date(field.value);
                                          const hour = newDate.getHours();
                                          if (hour < 12) {
                                            newDate.setHours(hour + 12);
                                          }
                                          field.onChange(newDate);
                                        }}
                                      >
                                        PM
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End</FormLabel>
                    <div className="grid grid-cols-1 gap-2">
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="pl-3 text-left font-normal flex justify-start items-center overflow-hidden"
                            >
                              <CalendarIcon className="min-w-4 h-4 mr-2" />
                              <span className="truncate">
                                {format(field.value, window.innerWidth < 640 ? 'MMM d, yyyy' : 'PPP')}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (date) {
                                  // Preserve the time from the existing end date
                                  const newDate = new Date(date);
                                  newDate.setHours(
                                    field.value.getHours(),
                                    field.value.getMinutes()
                                  );
                                  field.onChange(newDate);
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      
                      {/* Time selection - Redesigned with better theme consistency and improved spacing */}
                      {!watchAllDay && (
                        <div className="flex gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="pl-3 text-left font-normal flex justify-start items-center w-full"
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                {format(field.value, 'h:mm a')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-4" align="start">
                              <div className="grid gap-4">
                                <div className="grid gap-2">
                                  <div className="flex justify-between items-center gap-4">
                                    <Label className="min-w-16">Hours</Label>
                                    <div className="flex items-center border rounded-md">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-r-none"
                                        onClick={() => {
                                          const newDate = new Date(field.value);
                                          const hour = newDate.getHours() === 0 ? 23 : newDate.getHours() - 1;
                                          newDate.setHours(hour);
                                          field.onChange(newDate);
                                        }}
                                      >
                                        <ChevronLeft className="h-4 w-4" />
                                      </Button>
                                      <div className="w-10 text-center">
                                        {format(field.value, 'h')}
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon" 
                                        className="h-8 w-8 rounded-l-none"
                                        onClick={() => {
                                          const newDate = new Date(field.value);
                                          const hour = newDate.getHours() === 23 ? 0 : newDate.getHours() + 1;
                                          newDate.setHours(hour);
                                          field.onChange(newDate);
                                        }}
                                      >
                                        <ChevronRight className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center gap-4">
                                    <Label className="min-w-16">Minutes</Label>
                                    <div className="flex items-center border rounded-md">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-r-none"
                                        onClick={() => {
                                          const newDate = new Date(field.value);
                                          const min = newDate.getMinutes();
                                          const newMin = min < 15 ? 45 : min < 30 ? 0 : min < 45 ? 15 : 30;
                                          newDate.setMinutes(newMin);
                                          field.onChange(newDate);
                                        }}
                                      >
                                        <ChevronLeft className="h-4 w-4" />
                                      </Button>
                                      <div className="w-10 text-center">
                                        {format(field.value, 'mm')}
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-l-none"
                                        onClick={() => {
                                          const newDate = new Date(field.value);
                                          const min = newDate.getMinutes();
                                          const newMin = min < 15 ? 15 : min < 30 ? 30 : min < 45 ? 45 : 0;
                                          newDate.setMinutes(newMin);
                                          field.onChange(newDate);
                                        }}
                                      >
                                        <ChevronRight className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center gap-4">
                                    <Label className="min-w-16">AM/PM</Label>
                                    <div className="flex">
                                      <Button
                                        type="button"
                                        variant={format(field.value, 'a') === 'AM' ? 'default' : 'outline'}
                                        size="sm"
                                        className="rounded-r-none px-3"
                                        onClick={() => {
                                          const newDate = new Date(field.value);
                                          const hour = newDate.getHours();
                                          if (hour >= 12) {
                                            newDate.setHours(hour - 12);
                                          }
                                          field.onChange(newDate);
                                        }}
                                      >
                                        AM
                                      </Button>
                                      <Button
                                        type="button"
                                        variant={format(field.value, 'a') === 'PM' ? 'default' : 'outline'}
                                        size="sm"
                                        className="rounded-l-none px-3"
                                        onClick={() => {
                                          const newDate = new Date(field.value);
                                          const hour = newDate.getHours();
                                          if (hour < 12) {
                                            newDate.setHours(hour + 12);
                                          }
                                          field.onChange(newDate);
                                        }}
                                      >
                                        PM
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="allDay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>All Day Event</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id}
                          className="flex items-center"
                        >
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center">
                      <Repeat className="w-4 h-4 mr-1" />
                      Recurring Event
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <AnimatePresence>
              {showRecurring && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="recurringFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recurringInterval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Every</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              placeholder="1" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <DialogFooter className="flex justify-between gap-2">
              <div className="flex gap-2">
                {editEvent && (
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editEvent ? 'Update' : 'Create'} Event
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 