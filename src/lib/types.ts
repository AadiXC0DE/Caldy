export type Priority = 'low' | 'medium' | 'high';

export type EntityLifecycle = {
  archivedAt?: Date;
  deletedAt?: Date;
};

export type Reminder = {
  id: string;
  at: Date;
  type: 'task' | 'event';
  acknowledgedAt?: Date;
};

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
  date: string;
  deleted?: boolean;
  title?: string;
  description?: string;
  location?: string;
  start?: Date;
  end?: Date;
  color?: string;
  categoryId?: string;
};

export type Event = EntityLifecycle & {
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
    exceptions?: RecurringException[];
  };
  tags?: string[];
  color?: string;
  reminder?: Date;
  reminders?: Reminder[];
};

export type ImportedCalendarEvent = Event & {
  sourceId: string;
  sourceName?: string;
  providerLabel?: string;
  isImported: true;
};

export type CalendarSource = {
  id: string;
  name: string;
  url: string;
  providerLabel?: string;
  color: string;
  enabled: boolean;
  kind: 'ical';
  lastSyncedAt?: Date;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type RecurringPattern = {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  occurrences?: number;
  daysOfWeek?: number[];
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

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Task = EntityLifecycle & {
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
  subtasks?: Subtask[];
  reminder?: Date;
  reminders?: Reminder[];
  linkedNoteIds?: string[];
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

export type Habit = EntityLifecycle & {
  id: string;
  name: string;
  color: string;
  icon: string;
  frequency: 'daily' | 'weekly';
  completedDates: string[];
  createdAt: Date;
  isTemplate?: boolean;
};

export type Note = EntityLifecycle & {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  folder?: string;
  tags?: string[];
  isTemplate?: boolean;
  isDailyNote?: boolean;
  dailyNoteDate?: string;
  linkedNoteTitles?: string[];
  linkedTaskIds?: string[];
  linkedEventIds?: string[];
  linkedTaskId?: string;
  linkedEventId?: string;
};

export type Template = {
  id: string;
  title: string;
  type: 'task' | 'note' | 'event' | 'habit';
  description?: string;
  sourceId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GlobalSearchDocument = {
  id: string;
  entityId: string;
  title: string;
  body?: string;
  section?: string;
  type:
    | 'event'
    | 'imported-event'
    | 'task'
    | 'festival'
    | 'note'
    | 'habit'
    | 'task-view'
    | 'calendar-source'
    | 'mail-thread'
    | 'command';
  keywords?: string[];
  url: string;
  updatedAt: Date;
};

export type InboxAccount = {
  id: string;
  name: string;
  provider: 'local-import' | 'gmail' | 'fastmail' | 'imap';
  emailAddress?: string;
  color: string;
  connectedAt: Date;
  lastImportedAt?: Date;
  lastError?: string;
  status: 'ready' | 'warning' | 'error';
};

export type MailLabel = {
  id: string;
  name: string;
  color?: string;
};

export type MailMessage = {
  id: string;
  threadId: string;
  accountId: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  sentAt: Date;
  preview: string;
  html?: string;
  text?: string;
  labels?: string[];
  isRead: boolean;
  isStarred?: boolean;
};

export type MailThread = {
  id: string;
  accountId: string;
  subject: string;
  participants: string[];
  preview: string;
  labels?: string[];
  latestMessageAt: Date;
  unreadCount: number;
  isArchived?: boolean;
  isPinned?: boolean;
  messageIds: string[];
};

export type MailViewState = {
  activeAccountId: string | 'all';
  activeLabelId: string | 'all';
  query: string;
  selectedThreadId?: string;
};
