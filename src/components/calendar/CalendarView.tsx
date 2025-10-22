'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import AddEventDialog from './AddEventDialog';
import IcalEventDialog from './IcalEventDialog';
import { MonthYearPicker } from './MonthYearPicker';
import { RecurringEditDialog } from './RecurringEditDialog';
import { EventClickArg, EventDropArg, DatesSetArg } from '@fullcalendar/core';

interface ICalEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  description?: string;
  location?: string;
  isFestival?: boolean;
}

interface DateClickArg {
  date: Date;
  dateStr: string;
  allDay: boolean;
  dayEl: HTMLElement;
  jsEvent: MouseEvent;
  view: {
    type: string;
    title: string;
    currentStart: Date;
    currentEnd: Date;
  };
}

interface EventResizeDoneArg {
  event: {
    id: string;
    start: Date | null;
    end: Date | null;
  };
}

interface FestivalEvent {
  id: string;
  title: string;
  start: Date;
  end: Date | null;
  allDay: boolean;
  description?: string;
  types?: string[];
  countries?: string[];
  color?: string;
}

interface CalendarViewProps {
  showHeader?: boolean;
  [key: string]: unknown; // to be fixed later
}

function CalendarViewClient({ showHeader = true }) {
  const { 
    events, 
    tasks, 
    updateEvent,
    updateRecurringEventInstance,
    deleteRecurringEventInstance,
    categories,
    view,
    icalEvents,
    festivals,
    showFestivals
  } = useApp();
  
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');
  const festivalId = searchParams.get('festival');
  const dateParam = searchParams.get('date');
  
  const calendarRef = useRef<FullCalendar>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date>(new Date());
  const [isIcalEventOpen, setIsIcalEventOpen] = useState(false);
  const [selectedIcalEvent, setSelectedIcalEvent] = useState<ICalEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isRecurringEditDialogOpen, setIsRecurringEditDialogOpen] = useState(false);
  const [pendingRecurringEdit, setPendingRecurringEdit] = useState<{
    originalEventId: string;
    occurrenceDate?: string;
  } | null>(null);
  const [editingOccurrenceDate, setEditingOccurrenceDate] = useState<string | undefined>(undefined);
  
  // Effect to update calendar view when view changes
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      
      if (view === 'month') {
        calendarApi.changeView('dayGridMonth');
      } else if (view === 'week') {
        calendarApi.changeView('timeGridWeek');
      } else if (view === 'day') {
        calendarApi.changeView('timeGridDay');
      } else if (view === 'list') {
        calendarApi.changeView('listWeek');
      }
    }
  }, [view]);
  
  useEffect(() => {
    // Handle date parameter
    if (dateParam) {
      try {
        const dateFromUrl = new Date(dateParam);
        if (!isNaN(dateFromUrl.getTime())) {
          // Valid date - navigate calendar to this date
          setCurrentDate(dateFromUrl);
          if (calendarRef.current) {
            calendarRef.current.getApi().gotoDate(dateFromUrl);
          }
        }
      } catch (e) {
        console.error("Invalid date parameter:", e);
      }
    }
    
    // Handle event parameter
    if (eventId) {
      const foundEvent = events.find(event => event.id === eventId);
      if (foundEvent) {
        setSelectedEventId(eventId);
        setIsAddEventOpen(true);
        
        // Also navigate to the event date if not already there
        if (calendarRef.current && foundEvent.start) {
          calendarRef.current.getApi().gotoDate(new Date(foundEvent.start));
        }
      } else {
        // If not found in regular events, check in iCal events
        const foundIcalEvent = icalEvents.find(event => event.id === eventId);
        
        if (foundIcalEvent) {
          setSelectedIcalEvent({
            title: foundIcalEvent.title,
            start: new Date(foundIcalEvent.start),
            end: new Date(foundIcalEvent.end || foundIcalEvent.start),
            allDay: foundIcalEvent.allDay || false,
            description: foundIcalEvent.description,
            location: foundIcalEvent.location,
          });
          setIsIcalEventOpen(true);
          
          // Navigate to the iCal event date
          if (calendarRef.current && foundIcalEvent.start) {
            calendarRef.current.getApi().gotoDate(new Date(foundIcalEvent.start));
          }
        }
      }
    }
    
    // Handle festival parameter
    if (festivalId) {
      const foundFestival = festivals.find(festival => festival.id === festivalId);
      if (foundFestival) {
        setSelectedIcalEvent({
          title: foundFestival.title,
          start: new Date(foundFestival.start),
          end: new Date(foundFestival.end || foundFestival.start),
          allDay: foundFestival.allDay || true,
          description: foundFestival.description,
          isFestival: true,
        });
        setIsIcalEventOpen(true);
        
        // Also navigate to the festival date
        if (calendarRef.current && foundFestival.start) {
          calendarRef.current.getApi().gotoDate(new Date(foundFestival.start));
        }
      }
    }
  }, [eventId, festivalId, dateParam, events, festivals, icalEvents]);
  
  // Handle date change from the MonthYearPicker
  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(date);
    }
  };
  
  // Generate recurring event instances
  const generateRecurringInstances = (event: typeof events[0], viewStart: Date, viewEnd: Date) => {
    if (!event.recurring) return [event];
    
    const instances = [];
    const { recurring } = event;
    let currentDate = new Date(event.start);
    
    // Ensure we start from the event's original date
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const duration = eventEnd.getTime() - eventStart.getTime();
    
    // Limit iterations to prevent infinite loops
    let iterationCount = 0;
    const maxIterations = 1000;
    
    while (currentDate <= viewEnd && iterationCount < maxIterations) {
      iterationCount++;
      
      // Check if this occurrence is within the view range
      if (currentDate >= viewStart || 
          (currentDate < viewStart && new Date(currentDate.getTime() + duration) >= viewStart)) {
        
        // Check if we've passed the recurring end date
        if (recurring.endDate && currentDate > new Date(recurring.endDate)) {
          break;
        }
        
        // Format the date as ISO string for exception lookup
        const occurrenceDate = currentDate.toISOString().split('T')[0];
        
        // Check if this occurrence has an exception
        const exception = recurring.exceptions?.find(ex => ex.date === occurrenceDate);
        
        // Skip this occurrence if it's marked as deleted
        if (exception?.deleted) {
          // Move to next occurrence before continuing
          switch (recurring.frequency) {
            case 'daily':
              currentDate.setDate(currentDate.getDate() + recurring.interval);
              break;
            case 'weekly':
              if (recurring.daysOfWeek && recurring.daysOfWeek.length > 0) {
                currentDate.setDate(currentDate.getDate() + 1);
              } else {
                currentDate.setDate(currentDate.getDate() + 7 * recurring.interval);
              }
              break;
            case 'monthly':
              currentDate.setMonth(currentDate.getMonth() + recurring.interval);
              break;
            case 'yearly':
              currentDate.setFullYear(currentDate.getFullYear() + recurring.interval);
              break;
          }
          continue;
        }
        
        // For weekly recurrence with specific days
        if (recurring.frequency === 'weekly' && recurring.daysOfWeek && recurring.daysOfWeek.length > 0) {
          const dayOfWeek = currentDate.getDay();
          if (recurring.daysOfWeek.includes(dayOfWeek)) {
            const instanceStart = new Date(currentDate);
            const instanceEnd = new Date(currentDate.getTime() + duration);
            
            // Apply exception modifications if they exist
            instances.push({
              ...event,
              title: exception?.title ?? event.title,
              description: exception?.description ?? event.description,
              location: exception?.location ?? event.location,
              color: exception?.color ?? event.color,
              categoryId: exception?.categoryId ?? event.categoryId,
              start: exception?.start ? new Date(exception.start) : instanceStart,
              end: exception?.end ? new Date(exception.end) : instanceEnd,
              // Store the occurrence date for later identification
              occurrenceDate,
            });
          }
        } else {
          // For other frequencies or weekly without specific days
          const instanceStart = new Date(currentDate);
          const instanceEnd = new Date(currentDate.getTime() + duration);
          
          // Apply exception modifications if they exist
          instances.push({
            ...event,
            title: exception?.title ?? event.title,
            description: exception?.description ?? event.description,
            location: exception?.location ?? event.location,
            color: exception?.color ?? event.color,
            categoryId: exception?.categoryId ?? event.categoryId,
            start: exception?.start ? new Date(exception.start) : instanceStart,
            end: exception?.end ? new Date(exception.end) : instanceEnd,
            // Store the occurrence date for later identification
            occurrenceDate,
          });
        }
      }
      
      // Calculate next occurrence
      switch (recurring.frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + recurring.interval);
          break;
        case 'weekly':
          if (recurring.daysOfWeek && recurring.daysOfWeek.length > 0) {
            // Move to next day and check if it matches
            currentDate.setDate(currentDate.getDate() + 1);
            
            // If we've gone through a full week without matches, skip to next week
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            
            // Check if current day is in the allowed days
            const currentDay = currentDate.getDay();
            if (!recurring.daysOfWeek.includes(currentDay)) {
              // Find next allowed day
              let foundNextDay = false;
              for (let i = 1; i <= 7; i++) {
                const testDate = new Date(currentDate);
                testDate.setDate(testDate.getDate() + i);
                const testDay = testDate.getDay();
                
                if (recurring.daysOfWeek.includes(testDay)) {
                  currentDate = testDate;
                  foundNextDay = true;
                  break;
                }
              }
              
              if (!foundNextDay) {
                // Should not happen, but safety fallback
                currentDate.setDate(currentDate.getDate() + 7 * recurring.interval);
              }
            }
          } else {
            currentDate.setDate(currentDate.getDate() + 7 * recurring.interval);
          }
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + recurring.interval);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + recurring.interval);
          break;
      }
    }
    
    return instances;
  };
  
  // Get the current view date range (we'll use a wide range to cover the visible calendar)
  const getViewDateRange = () => {
    const start = new Date(currentDate);
    start.setMonth(start.getMonth() - 2); // 2 months before
    const end = new Date(currentDate);
    end.setMonth(end.getMonth() + 3); // 3 months after
    return { start, end };
  };
  
  // Convert our events to FullCalendar format with recurring instances
  // Use useMemo to recalculate when currentDate changes
  const fullCalendarEvents = React.useMemo(() => {
    const { start: viewStart, end: viewEnd } = getViewDateRange();
    
    return events.flatMap(event => {
      const instances = generateRecurringInstances(event, viewStart, viewEnd);
      
      return instances.map((instance: any) => {
        const category = categories.find(cat => cat.id === event.categoryId);
        return {
          id: instance.occurrenceDate ? `${event.id}-${instance.occurrenceDate}` : event.id,
          title: instance.title,
          start: instance.start,
          end: instance.end,
          allDay: instance.allDay,
          backgroundColor: instance.color || category?.color || '#4F46E5',
          borderColor: instance.color || category?.color || '#4F46E5',
          extendedProps: {
            description: instance.description,
            location: instance.location,
            categoryId: instance.categoryId,
            recurring: instance.recurring,
            tags: instance.tags,
            originalEventId: event.id,
            occurrenceDate: instance.occurrenceDate,
          },
        };
      });
    });
  }, [events, categories, currentDate]);
  
  // Convert iCal events to FullCalendar format
  const icalCalendarEvents = icalEvents.map(event => {
    return {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      backgroundColor: '#3788d8', // Default color for imported events
      borderColor: '#3788d8',
      classNames: ['ical-event'],
      editable: false, // iCal events can't be edited
      extendedProps: {
        description: event.description,
        location: event.location,
        isIcalEvent: true,
      },
    };
  });
  
  const festivalCalendarEvents = showFestivals ? festivals.map(festival => {
    const typedFestival = festival as unknown as FestivalEvent;
    return {
      id: typedFestival.id,
      title: typedFestival.title,
      start: typedFestival.start,
      end: typedFestival.end || undefined,
      allDay: typedFestival.allDay,
      backgroundColor: typedFestival.color || '#FF5722',
      borderColor: typedFestival.color || '#FF5722',
      classNames: ['festival-event'],
      editable: false, // Festivals can't be edited
      extendedProps: {
        description: typedFestival.description,
        isFestival: true,
        types: typedFestival.types,
        countries: typedFestival.countries,
      },
    };
  }) : [];
  
  const taskEvents = tasks
    .filter(task => task.dueDate && !task.completed)
    .map(task => {
      const category = categories.find(cat => cat.id === task.categoryId);
      return {
        id: `task-${task.id}`,
        title: `📋 ${task.title}`,
        start: task.dueDate,
        allDay: true,
        backgroundColor: category?.color || '#F59E0B',
        borderColor: category?.color || '#F59E0B',
        textColor: '#fff',
        classNames: ['task-event'],
        extendedProps: {
          isTask: true,
          taskId: task.id,
          priority: task.priority,
        },
      };
    });
  
  const handleDateClick = (arg: DateClickArg) => {
    const startDate = new Date(arg.date);
    setDefaultDate(startDate);
    setSelectedEventId(null);
    setIsAddEventOpen(true);
  };
  
  const handleEventClick = (arg: EventClickArg) => {
    if (arg.event.extendedProps.isFestival) {
      setSelectedIcalEvent({
        title: arg.event.title,
        start: arg.event.start as Date,
        end: arg.event.end as Date || arg.event.start as Date,
        allDay: arg.event.allDay,
        description: arg.event.extendedProps.description,
        isFestival: true,
      });
      setIsIcalEventOpen(true);
      return;
    }
    
    if (arg.event.extendedProps.isIcalEvent) {
      setSelectedIcalEvent({
        title: arg.event.title,
        start: arg.event.start as Date,
        end: arg.event.end as Date || new Date((arg.event.start as Date).getTime() + 60 * 60 * 1000),
        allDay: arg.event.allDay,
        description: arg.event.extendedProps.description,
        location: arg.event.extendedProps.location,
      });
      setIsIcalEventOpen(true);
      return;
    }
    
    // If it's a task event, handle differently
    if (arg.event.extendedProps.isTask) {
      toast.info('This is a task with due date. Edit in Tasks tab.');
      return;
    }
    
    // Check if it's a recurring event instance
    const originalEventId = arg.event.extendedProps.originalEventId;
    const occurrenceDate = arg.event.extendedProps.occurrenceDate;
    
    if (originalEventId && occurrenceDate) {
      // It's a recurring event instance - open editor directly
      // User will choose "this event" or "all events" when saving
      setSelectedEventId(originalEventId);
      setIsAddEventOpen(true);
      return;
    }
    
    // Open event editing dialog for regular events
    const eventId = arg.event.extendedProps.originalEventId || arg.event.id;
    setSelectedEventId(eventId);
    setIsAddEventOpen(true);
  };
  
  const handleEditThisOccurrence = () => {
    if (!pendingRecurringEdit) return;
    
    // Set the occurrence date so AddEventDialog knows to edit only this instance
    setEditingOccurrenceDate(pendingRecurringEdit.occurrenceDate);
    setSelectedEventId(pendingRecurringEdit.originalEventId);
    setIsAddEventOpen(true);
    setIsRecurringEditDialogOpen(false);
    setPendingRecurringEdit(null);
  };
  
  const handleEditAllOccurrences = () => {
    if (!pendingRecurringEdit) return;
    
    // Clear the occurrence date to edit the entire recurring event
    setEditingOccurrenceDate(undefined);
    setSelectedEventId(pendingRecurringEdit.originalEventId);
    setIsAddEventOpen(true);
    setIsRecurringEditDialogOpen(false);
    setPendingRecurringEdit(null);
  };
  
  const handleEventDrop = (arg: EventDropArg) => {
    // Update event dates when dragged/dropped
    const eventId = arg.event.id;
    const newStart = arg.event.start as Date;
    const newEnd = arg.event.end as Date || new Date(newStart.getTime() + 60 * 60 * 1000);
    
    updateEvent(eventId, {
      start: newStart,
      end: newEnd,
    });
    
    toast.success('Event rescheduled');
  };
  
  const handleEventResize = (arg: EventResizeDoneArg) => {
    // Update event duration when resized
    const eventId = arg.event.id;
    const newStart = arg.event.start as Date;
    const newEnd = arg.event.end as Date;
    
    updateEvent(eventId, {
      start: newStart,
      end: newEnd,
    });
    
    toast.success('Event duration updated');
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    setCurrentDate(arg.view.currentStart);
  };

  return (
    <div className="h-full flex flex-col">
      {showHeader && (
        <div className="mb-2 flex justify-end">
          <MonthYearPicker 
            currentDate={currentDate} 
            onDateChange={handleDateChange}
            className="mb-2"
          />
        </div>
      )}
      
      <div className="flex-grow">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={view === 'month' ? 'dayGridMonth' : 
                      view === 'week' ? 'timeGridWeek' : 
                      view === 'day' ? 'timeGridDay' : 'listWeek'}
          headerToolbar={false} // We're using our own header buttons
          events={[...fullCalendarEvents, ...icalCalendarEvents, ...taskEvents, ...festivalCalendarEvents]}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          height="100%"
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          datesSet={handleDatesSet}
          nowIndicator={true}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
          }}
          stickyHeaderDates={true}
          eventDidMount={(arg) => {
            // Add animations or special styles to events
            if (arg.event.extendedProps.isTask) {
              arg.el.classList.add('task-event');
              
              // Add priority indicator
              const priority = arg.event.extendedProps.priority;
              if (priority === 'high') {
                const dot = document.createElement('span');
                dot.className = 'absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full';
                arg.el.appendChild(dot);
              }
            }
            
            // Add style for iCal events
            // if (arg.event.extendedProps.isIcalEvent) {
            //   arg.el.classList.add('ical-event');
            //   const dot = document.createElement('span');
            //   dot.className = 'absolute top-0 left-0 h-2 w-2 bg-blue-500 rounded-full';
            //   arg.el.appendChild(dot);
            // }
            
            if (arg.event.extendedProps.isFestival) {
              arg.el.classList.add('festival-event');
              const icon = document.createElement('span');
              icon.className = 'festival-icon';
              icon.innerHTML = '🎉 ';
              arg.el.querySelector('.fc-event-title')?.prepend(icon);
            }
          }}
        />
      </div>
      
      <AddEventDialog 
        open={isAddEventOpen} 
        onOpenChange={(open) => {
          setIsAddEventOpen(open);
          if (!open) {
            // Clear occurrence date when closing
            setEditingOccurrenceDate(undefined);
          }
        }}
        defaultDate={defaultDate}
        editEvent={selectedEventId ? events.find(e => e.id === selectedEventId) : undefined}
        occurrenceDate={editingOccurrenceDate}
      />
      <IcalEventDialog
        open={isIcalEventOpen}
        onOpenChange={setIsIcalEventOpen}
        event={selectedIcalEvent}
      />
      <RecurringEditDialog
        open={isRecurringEditDialogOpen}
        onOpenChange={setIsRecurringEditDialogOpen}
        onEditThis={handleEditThisOccurrence}
        onEditAll={handleEditAllOccurrences}
      />
    </div>
  );
}

export default function CalendarView(props: CalendarViewProps) {
  return (
    <Suspense fallback={<div>Loading calendar view...</div>}>
      <CalendarViewClient {...props} />
    </Suspense>
  );
} 