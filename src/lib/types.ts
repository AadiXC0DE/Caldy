export type Priority = 'low' | 'medium' | 'high';

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Tag = {
  id: string;
  name: string;
};

export type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  description?: string;
  location?: string;
  categoryId?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
  };
  tags?: string[];
  color?: string;
  reminder?: Date;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  date?: Date;
  dueDate?: Date;
  completed: boolean;
  priority: Priority;
  categoryId?: string;
  tags?: string[];
  progress?: number;
};

export type CalendarView = 'month' | 'week' | 'day' | 'list'; 