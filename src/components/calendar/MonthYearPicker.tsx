'use client';

import React, { useState } from 'react';
import { format, addMonths, addYears, setMonth, setYear } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MonthYearPickerProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

export function MonthYearPicker({ 
  currentDate, 
  onDateChange, 
  className 
}: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'month' | 'year'>('month');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years (5 years before and after current)
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handlePrevious = () => {
    onDateChange(addMonths(currentDate, -1));
  };

  const handleNext = () => {
    onDateChange(addMonths(currentDate, 1));
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = setMonth(currentDate, monthIndex);
    onDateChange(newDate);
    setIsOpen(false);
  };

  const handleYearSelect = (year: number) => {
    const newDate = setYear(currentDate, year);
    onDateChange(newDate);
    setIsOpen(false);
  };

  const handleToday = () => {
    onDateChange(new Date());
    setIsOpen(false);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handlePrevious}
        className="h-9 w-9 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous month</span>
      </Button>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="px-3 font-medium"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(currentDate, 'MMMM yyyy')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="center">
          <div className="mb-2 flex items-center justify-between border-b pb-2">
            <Button 
              variant={selectedOption === 'month' ? "default" : "ghost"} 
              size="sm"
              onClick={() => setSelectedOption('month')}
              className="text-sm"
            >
              Months
            </Button>
            <Button 
              variant={selectedOption === 'year' ? "default" : "ghost"} 
              size="sm"
              onClick={() => setSelectedOption('year')}
              className="text-sm"
            >
              Years
            </Button>
          </div>
          
          {selectedOption === 'month' ? (
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => (
                <Button
                  key={month}
                  variant={currentMonth === index ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleMonthSelect(index)}
                  className={`text-sm ${currentMonth === index ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  {month.slice(0, 3)}
                </Button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {years.map(year => (
                <Button
                  key={year}
                  variant={currentYear === year ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleYearSelect(year)}
                  className={`text-sm ${currentYear === year ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  {year}
                </Button>
              ))}
            </div>
          )}
          
          <div className="mt-2 border-t pt-2 text-center">
            <Button 
              variant="link" 
              size="sm" 
              onClick={handleToday}
              className="text-sm text-primary"
            >
              Today
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleNext}
        className="h-9 w-9 p-0"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next month</span>
      </Button>
    </div>
  );
}