'use client';

import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Clock, Calendar } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';

interface IcalEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    description?: string;
    location?: string;
  } | null;
}

export default function IcalEventDialog({
  open,
  onOpenChange,
  event,
}: IcalEventDialogProps) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            <span className="flex-1">{event.title}</span>
            <Badge variant="outline" className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
              External Calendar
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium">Time</div>
              <div className="text-sm text-muted-foreground">
                {event.allDay ? (
                  <span>All day</span>
                ) : (
                  <>
                    {format(event.start, 'EEEE, MMMM d, yyyy')}
                    <br />
                    {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                  </>
                )}
              </div>
            </div>
          </div>

          {event.location && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium">Location</div>
                <div className="text-sm text-muted-foreground">{event.location}</div>
              </div>
            </div>
          )}

          {event.description && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 pt-1">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium">Description</div>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {event.description}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
            This event is imported from an external calendar and cannot be edited.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 