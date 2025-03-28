'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Event } from '@/lib/types';
import { toast } from 'sonner';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import AddEventDialog from './AddEventDialog';

export default function CalendarView() {
  const { 
    events, 
    tasks, 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    categories,
    view,
  } = useApp();
  
  const calendarRef = useRef<FullCalendar>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date>(new Date());
  
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
  
  // Convert our events to FullCalendar format
  const fullCalendarEvents = events.map(event => {
    const category = categories.find(cat => cat.id === event.categoryId);
    return {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      backgroundColor: event.color || category?.color || '#4F46E5',
      borderColor: event.color || category?.color || '#4F46E5',
      extendedProps: {
        description: event.description,
        location: event.location,
        categoryId: event.categoryId,
        recurring: event.recurring,
        tags: event.tags,
      },
    };
  });
  
  // Add incomplete tasks with due dates to the calendar
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
  
  const handleDateClick = (arg: any) => {
    // Open event creation dialog with this date
    const startDate = new Date(arg.date);
    setDefaultDate(startDate);
    setSelectedEventId(null);
    setIsAddEventOpen(true);
  };
  
  const handleEventClick = (arg: any) => {
    // If it's a task event, handle differently
    if (arg.event.extendedProps.isTask) {
      toast.info('This is a task with due date. Edit in Tasks tab.');
      return;
    }
    
    // Open event editing dialog
    const eventId = arg.event.id;
    setSelectedEventId(eventId);
    setIsAddEventOpen(true);
  };
  
  const handleEventDrop = (arg: any) => {
    // Update event dates when dragged/dropped
    const eventId = arg.event.id;
    const newStart = arg.event.start;
    const newEnd = arg.event.end || new Date(newStart.getTime() + 60 * 60 * 1000);
    
    updateEvent(eventId, {
      start: newStart,
      end: newEnd,
    });
    
    toast.success('Event rescheduled');
  };
  
  const handleEventResize = (arg: any) => {
    // Update event duration when resized
    const eventId = arg.event.id;
    const newStart = arg.event.start;
    const newEnd = arg.event.end;
    
    updateEvent(eventId, {
      start: newStart,
      end: newEnd,
    });
    
    toast.success('Event duration updated');
  };

  return (
    <div className="h-full">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView={view === 'month' ? 'dayGridMonth' : 
                    view === 'week' ? 'timeGridWeek' : 
                    view === 'day' ? 'timeGridDay' : 'listWeek'}
        headerToolbar={false} // We're using our own header buttons
        events={[...fullCalendarEvents, ...taskEvents]}
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
        }}
      />
      <AddEventDialog 
        open={isAddEventOpen} 
        onOpenChange={setIsAddEventOpen}
        defaultDate={defaultDate}
        editEvent={selectedEventId ? events.find(e => e.id === selectedEventId) : undefined}
      />
    </div>
  );
} 