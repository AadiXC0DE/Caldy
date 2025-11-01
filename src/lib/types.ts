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

export type RecurringException = {
  date: string; // ISO date string for the occurrence date
  deleted?: boolean; // If true, this occurrence is deleted
  // Modified fields for this specific occurrence
  title?: string;
  description?: string;
  location?: string;
  start?: Date;
  end?: Date;
  color?: string;
  categoryId?: string;
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
    exceptions?: RecurringException[]; // Exceptions for specific occurrences
  };
  tags?: string[];
  color?: string;
  reminder?: Date;
};

export type RecurringPattern = {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  occurrences?: number;
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
};

export type TimeTracking = {
  estimatedMinutes?: number;
  actualMinutes?: number;
  pomodoroCount?: number;
  pomodoroSettings?: {
    workMinutes: number;
    breakMinutes: number;
    longBreakMinutes: number;
    longBreakInterval: number;
  };
  sessions?: {
    date: Date;
    durationMinutes: number;
    type: 'work' | 'break' | 'long-break';
  }[];
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
  order?: number;
  recurring?: RecurringPattern;
  timeTracking?: TimeTracking;
  isTemplate?: boolean;
  dependsOn?: string[];
};

export type TaskView = {
  id: string;
  name: string;
  filters: {
    searchTerm?: string;
    priority?: Priority | 'all';
    category?: string | 'all';
    completed?: 'all' | 'completed' | 'incomplete';
    tags?: string[];
    dueDateRange?: {
      start?: Date;
      end?: Date;
    };
  };
  sortBy: 'dueDate' | 'priority' | 'title' | 'createdAt' | 'order' | 'progress';
  sortDirection: 'asc' | 'desc';
};

export type CalendarView = 'month' | 'week' | 'day' | 'list'; 