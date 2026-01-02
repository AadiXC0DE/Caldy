'use client';

import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './AddEventDialog';

interface RecurringTaskSettingsProps {
  form: UseFormReturn<FormValues>;
  showRecurring?: boolean;
  setShowRecurring?: (show: boolean) => void;
}

const DAYS_OF_WEEK = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

export function RecurringEventSettings({ 
  form, 
}: RecurringTaskSettingsProps) {
  const frequency = form.watch('recurring.frequency');
  
  return (
    <div className="space-y-4 p-4 border rounded-md bg-muted/20">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="recurring.frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
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
          name="recurring.interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repeat every</FormLabel>
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <span className="text-sm">
                  {frequency === 'daily' && 'day(s)'}
                  {frequency === 'weekly' && 'week(s)'}
                  {frequency === 'monthly' && 'month(s)'}
                  {frequency === 'yearly' && 'year(s)'}
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {frequency === 'weekly' && (
        <FormField
          control={form.control}
          name="recurring.daysOfWeek"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repeat on</FormLabel>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={(field.value || []).includes(parseInt(day.value))}
                      onCheckedChange={(checked: boolean) => {
                        const dayValue = parseInt(day.value);
                        const currentValues = (field.value || []) as number[];
                        if (checked) {
                          field.onChange([...currentValues, dayValue].sort());
                        } else {
                          field.onChange(currentValues.filter(v => v !== dayValue));
                        }
                      }}
                    />
                    <label
                      htmlFor={`day-${day.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {day.label.substring(0, 3)}
                    </label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="recurring.endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End date (optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={`pl-3 text-left font-normal ${
                        !field.value && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>No end date</span>
                      )}
                    </Button>
                  </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="recurring.occurrences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Occurrences (optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="Never ending"
                  value={field.value || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
} 