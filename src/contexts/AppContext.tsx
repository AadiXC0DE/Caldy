'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import { v4 as uuidv4 } from 'uuid';
import {
  CalendarSource,
  Event,
  Category,
  CalendarView,
  Habit,
  ImportedCalendarEvent,
  InboxAccount,
  MailMessage,
  MailThread,
  Note,
  RecurringPattern,
  Subtask,
  Tag,
  Task,
  TaskView,
  TimeTracking,
  GlobalSearchDocument,
} from '@/lib/types';
import { toast } from 'react-hot-toast';
import * as dbOps from '@/lib/db';
import { db } from '@/lib/db';

interface AppContextProps {
  // Events
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  updateRecurringEventInstance: (
    eventId: string,
    occurrenceDate: string,
    updates: Partial<Event>,
  ) => void;
  deleteRecurringEventInstance: (eventId: string, occurrenceDate: string) => void;
  deleteEvent: (id: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string, completed: boolean) => void;
  updateTaskProgress: (id: string, progress: number) => void;

  // New Task Features
  reorderTasks: (taskIds: string[]) => void;
  duplicateTask: (taskId: string) => string;
  batchUpdateTasks: (taskIds: string[], updates: Partial<Task>) => void;
  toggleTaskTemplate: (taskId: string) => void;
  createTaskFromTemplate: (templateId: string) => string;

  // Task Views
  taskViews: TaskView[];
  activeTaskView: string | null;
  addTaskView: (view: Omit<TaskView, 'id'>) => string;
  updateTaskView: (id: string, view: Partial<TaskView>) => void;
  deleteTaskView: (id: string) => void;
  setActiveTaskView: (id: string | null) => void;

  // Time Tracking
  startTaskTimer: (taskId: string, timerType: 'regular' | 'pomodoro') => void;
  stopTaskTimer: (taskId: string) => void;
  updateTaskTimeTracking: (taskId: string, timeTracking: Partial<TimeTracking>) => void;
  activeTimerTaskId: string | null;
  timerStatus: 'stopped' | 'running' | 'paused';
  timerType: 'regular' | 'pomodoro';
  timerSessionType: 'work' | 'break' | 'long-break';
  pomodoroSettings: {
    workMinutes: number;
    breakMinutes: number;
    longBreakMinutes: number;
    longBreakInterval: number;
  };
  updatePomodoroSettings: (
    settings: Partial<{
      workMinutes: number;
      breakMinutes: number;
      longBreakMinutes: number;
      longBreakInterval: number;
    }>,
  ) => void;

  // Recurring Tasks
  createNextRecurringTask: (taskId: string) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Tags
  tags: Tag[];
  addTag: (tag: Omit<Tag, 'id'>) => void;
  updateTag: (id: string, tag: Partial<Tag>) => void;
  deleteTag: (id: string) => void;

  // Calendar View
  view: CalendarView;
  setView: (view: CalendarView) => void;

  // Dark Mode
  darkMode: boolean;
  toggleDarkMode: () => void;

  // iCal Integration
  icalUrl: string | null;
  icalEvents: ImportedCalendarEvent[];
  setIcalUrl: (url: string | null) => void;
  refreshIcalEvents: () => Promise<void>;
  calendarSources: CalendarSource[];
  addCalendarSource: (
    source: Omit<CalendarSource, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncedAt' | 'lastError'>,
  ) => string;
  updateCalendarSource: (id: string, updates: Partial<CalendarSource>) => void;
  removeCalendarSource: (id: string) => void;
  toggleCalendarSource: (id: string, enabled: boolean) => void;
  refreshCalendarSource: (id: string) => Promise<void>;
  isLoadingIcal: boolean;

  // Festivals
  festivals: Event[];
  showFestivals: boolean;
  festivalCountry: string;
  festivalColor: string;
  setShowFestivals: (show: boolean) => void;
  setFestivalCountry: (country: string) => void;
  setFestivalColor: (color: string) => void;
  refreshFestivals: () => Promise<void>;
  isLoadingFestivals: boolean;
  availableCountries: { countryCode: string; name: string }[];

  // Habits
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDate: (habitId: string, date: string) => void;

  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  toggleNotePin: (id: string) => void;
  archiveNote: (id: string) => void;
  restoreNote: (id: string) => void;

  // Search
  searchDocuments: GlobalSearchDocument[];

  // Inbox
  mailAccounts: InboxAccount[];
  mailThreads: MailThread[];
  mailMessages: MailMessage[];
  importMailBundle: (payload: string) => { accountId: string; threadCount: number };
  markMailThreadRead: (threadId: string, read: boolean) => void;

  // Subtasks
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  // Confetti
  showConfetti: boolean;
  triggerConfetti: () => void;

  // Database loading state
  isLoading: boolean;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Default data
const defaultCategories: Category[] = [
  { id: uuidv4(), name: 'Work', color: '#4F46E5' },
  { id: uuidv4(), name: 'Personal', color: '#10B981' },
  { id: uuidv4(), name: 'Health', color: '#EF4444' },
  { id: uuidv4(), name: 'Finance', color: '#F59E0B' },
  { id: uuidv4(), name: 'Education', color: '#8B5CF6' },
];

const defaultTags: Tag[] = [
  { id: uuidv4(), name: 'Important' },
  { id: uuidv4(), name: 'Urgent' },
  { id: uuidv4(), name: 'Later' },
  { id: uuidv4(), name: 'Meeting' },
  { id: uuidv4(), name: 'Call' },
];

const defaultTaskViews: TaskView[] = [
  {
    id: uuidv4(),
    name: 'All Tasks',
    filters: {},
    sortBy: 'dueDate',
    sortDirection: 'asc',
  },
  {
    id: uuidv4(),
    name: 'High Priority',
    filters: {
      priority: 'high',
      completed: 'incomplete',
    },
    sortBy: 'dueDate',
    sortDirection: 'asc',
  },
  {
    id: uuidv4(),
    name: 'Due Today',
    filters: {
      completed: 'incomplete',
      dueDateRange: {
        start: new Date(),
        end: new Date(),
      },
    },
    sortBy: 'priority',
    sortDirection: 'desc',
  },
];

const defaultPomodoroSettings = {
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
};

function buildImportedEventId(
  sourceId: string | undefined,
  event: Pick<ImportedCalendarEvent, 'id' | 'title' | 'start'>,
) {
  if (!sourceId) {
    return event.id;
  }

  if (event.id.startsWith(`${sourceId}::`)) {
    return event.id;
  }

  const fallbackId = event.id || `${event.title}-${new Date(event.start).toISOString()}`;
  return `${sourceId}::${fallbackId}`;
}

function normalizeImportedCalendarEvent(event: ImportedCalendarEvent): ImportedCalendarEvent {
  return {
    ...event,
    id: buildImportedEventId(event.sourceId, event),
  };
}

const DEFAULT_NOTE_FOLDER = 'Workspace';
const DAILY_NOTE_FOLDER = 'Daily Notes';
const LEGACY_DEFAULT_NOTE_CONTENT = `# Untitled note

## Next actions
- [ ] Capture the next step

## Context

Link related work with [[Another Note]]
`;

function uniqueStrings(values: string[] | undefined): string[] {
  if (!values) return [];
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function extractWikiLinkTitles(content: string): string[] {
  const matches = Array.from(content.matchAll(/\[\[([^[\]]+)\]\]/g));
  return uniqueStrings(matches.map((match) => match[1] || ''));
}

function normalizeNote(note: Note): Note {
  const linkedTaskIds = uniqueStrings([
    ...(note.linkedTaskIds || []),
    ...(note.linkedTaskId ? [note.linkedTaskId] : []),
  ]);
  const linkedEventIds = uniqueStrings([
    ...(note.linkedEventIds || []),
    ...(note.linkedEventId ? [note.linkedEventId] : []),
  ]);
  const isDailyNote = note.isDailyNote ?? false;

  return {
    ...note,
    folder: note.folder || (isDailyNote ? DAILY_NOTE_FOLDER : DEFAULT_NOTE_FOLDER),
    tags: uniqueStrings(note.tags),
    isTemplate: note.isTemplate ?? false,
    isDailyNote,
    linkedTaskIds,
    linkedEventIds,
    linkedNoteTitles: uniqueStrings(note.linkedNoteTitles || extractWikiLinkTitles(note.content)),
  };
}

function sanitizeSearchBody(value?: string | null) {
  if (!value) return '';

  return value
    .replace(/\[\[([^[\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/[*_~`>|-]/g, ' ')
    .replace(/\[(x| )\]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 280);
}

function isLegacyPlaceholderNote(note: Note) {
  return (
    note.title === 'Untitled note' &&
    note.content.trim() === LEGACY_DEFAULT_NOTE_CONTENT.trim() &&
    (note.folder || DEFAULT_NOTE_FOLDER) === DEFAULT_NOTE_FOLDER &&
    !note.pinned &&
    !(note.tags || []).length &&
    !note.isTemplate &&
    !note.isDailyNote &&
    !(note.linkedTaskIds || []).length &&
    !(note.linkedEventIds || []).length &&
    !(note.linkedNoteTitles || []).length &&
    !note.archivedAt &&
    !note.deletedAt
  );
}

function collapseLegacyPlaceholderNotes(notes: Note[]) {
  const placeholderNotes = notes.filter(isLegacyPlaceholderNote);

  if (placeholderNotes.length <= 1) {
    return notes;
  }

  const [keep] = [...placeholderNotes].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );

  return notes.filter((note) => !isLegacyPlaceholderNote(note) || note.id === keep.id);
}

// Helper function to sync data to IndexedDB is removed in favor of direct DB operations

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Database loading state
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);
  const calendarSourcesRef = useRef<CalendarSource[]>([]);
  const icalEventsWriteQueueRef = useRef(Promise.resolve());
  const calendarSourcesWriteQueueRef = useRef(Promise.resolve());

  // Initialize state with default values (will be populated from DB)
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [tags, setTags] = useState<Tag[]>(defaultTags);
  const [view, setView] = useState<CalendarView>('month');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Task Views
  const [taskViews, setTaskViews] = useState<TaskView[]>(defaultTaskViews);
  const [activeTaskView, setActiveTaskView] = useState<string | null>(null);

  // Timer state
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [timerStatus, setTimerStatus] = useState<'stopped' | 'running' | 'paused'>('stopped');
  const [timerType, setTimerType] = useState<'regular' | 'pomodoro'>('regular');
  const [timerSessionType, setTimerSessionType] = useState<'work' | 'break' | 'long-break'>('work');
  const [pomodoroSettings, setPomodoroSettings] = useState(defaultPomodoroSettings);

  // Add iCal state
  const [icalUrl, setIcalUrlState] = useState<string | null>(null);
  const [calendarSources, setCalendarSources] = useState<CalendarSource[]>([]);
  const [icalEvents, setIcalEvents] = useState<ImportedCalendarEvent[]>([]);
  const [isLoadingIcal, setIsLoadingIcal] = useState(false);

  const [festivals, setFestivals] = useState<Event[]>([]);
  const [showFestivals, setShowFestivals] = useState<boolean>(true);
  const [festivalCountry, setFestivalCountry] = useState<string>('US');
  const [festivalColor, setFestivalColor] = useState<string>('#FF5722');
  const [isLoadingFestivals, setIsLoadingFestivals] = useState(false);
  const [availableCountries, setAvailableCountries] = useState<
    { countryCode: string; name: string }[]
  >([]);

  // Habits & Notes
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchDocuments, setSearchDocuments] = useState<GlobalSearchDocument[]>([]);
  const [mailAccounts, setMailAccounts] = useState<InboxAccount[]>([]);
  const [mailThreads, setMailThreads] = useState<MailThread[]>([]);
  const [mailMessages, setMailMessages] = useState<MailMessage[]>([]);

  // Confetti
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch available countries on initial load
  useEffect(() => {
    calendarSourcesRef.current = calendarSources;
  }, [calendarSources]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/countries');
        if (response.ok) {
          const data = await response.json();
          setAvailableCountries(data.countries);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    fetchCountries();
  }, []);

  // Initialize IndexedDB and migrate data
  useEffect(() => {
    const initializeDB = async () => {
      try {
        await dbOps.migrateFromLocalStorage();

        // Load data from IndexedDB if available
        const [dbEvents, dbTasks, dbCategories, dbTags, dbTaskViews] = await Promise.all([
          dbOps.getAllEvents(),
          dbOps.getAllTasks(),
          dbOps.getAllCategories(),
          dbOps.getAllTags(),
          dbOps.getAllTaskViews(),
        ]);

        if (dbEvents.length > 0) setEvents(dbEvents);
        if (dbTasks.length > 0) setTasks(dbTasks);
        if (dbCategories.length > 0) setCategories(dbCategories);
        if (dbTags.length > 0) setTags(dbTags);
        if (dbTaskViews.length > 0) setTaskViews(dbTaskViews);

        // Load habits and notes
        const [dbHabits, dbNotes] = await Promise.all([dbOps.getAllHabits(), dbOps.getAllNotes()]);
        if (dbHabits.length > 0) setHabits(dbHabits);
        if (dbNotes.length > 0) {
          setNotes(collapseLegacyPlaceholderNotes(dbNotes.map(normalizeNote)));
        }

        // Load settings from IndexedDB
        const [
          icalUrlSetting,
          darkModeSetting,
          pomodoroSettingsSetting,
          festivalCountrySetting,
          festivalColorSetting,
          showFestivalsSetting,
        ] = await Promise.all([
          dbOps.getSetting<string>('icalUrl'),
          dbOps.getSetting<boolean>('darkMode'),
          dbOps.getSetting<typeof defaultPomodoroSettings>('pomodoroSettings'),
          dbOps.getSetting<string>('festivalCountry'),
          dbOps.getSetting<string>('festivalColor'),
          dbOps.getSetting<boolean>('showFestivals'),
        ]);

        // Load active task view setting
        const activeViewSetting = await dbOps.getSetting<string>('activeTaskView');
        if (activeViewSetting) setActiveTaskView(activeViewSetting);

        if (icalUrlSetting !== undefined) setIcalUrlState(icalUrlSetting);
        if (darkModeSetting !== undefined) {
          setDarkMode(darkModeSetting);
          document.documentElement.classList.toggle('dark', darkModeSetting);
        }
        if (pomodoroSettingsSetting !== undefined) setPomodoroSettings(pomodoroSettingsSetting);
        if (festivalCountrySetting !== undefined) setFestivalCountry(festivalCountrySetting);
        if (festivalColorSetting !== undefined) setFestivalColor(festivalColorSetting);
        if (showFestivalsSetting !== undefined) setShowFestivals(showFestivalsSetting);

        // Load iCal events and festivals if cached
        const [
          dbICalEvents,
          dbFestivals,
          dbCalendarSources,
          dbSearchDocuments,
          dbMailAccounts,
          dbMailThreads,
          dbMailMessages,
        ] = await Promise.all([
          dbOps.getAllImportedCalendarEvents(),
          dbOps.getAllFestivals(),
          dbOps.getAllCalendarSources(),
          dbOps.getAllSearchDocuments(),
          dbOps.getAllMailAccounts(),
          dbOps.getAllMailThreads(),
          dbOps.getAllMailMessages(),
        ]);

        if (dbICalEvents.length > 0) {
          setIcalEvents(dbICalEvents.map(normalizeImportedCalendarEvent));
        }

        if (dbFestivals.length > 0) {
          setFestivals(dbFestivals as unknown as Event[]);
        }

        if (dbCalendarSources.length > 0) {
          setCalendarSources(dbCalendarSources);
        }

        if (dbSearchDocuments.length > 0) {
          setSearchDocuments(dbSearchDocuments);
        }

        if (dbMailAccounts.length > 0) {
          setMailAccounts(dbMailAccounts);
        }

        if (dbMailThreads.length > 0) {
          setMailThreads(dbMailThreads);
        }

        if (dbMailMessages.length > 0) {
          setMailMessages(dbMailMessages);
        }
      } catch (error) {
        console.error('Error initializing IndexedDB:', error);
      } finally {
        isInitialized.current = true;
        setIsLoading(false);
      }
    };

    initializeDB();
  }, []);

  // Save state to IndexedDB whenever it changes
  useEffect(() => {
    if (!isInitialized.current) return;
    db.events
      .clear()
      .then(() => db.events.bulkPut(events))
      .catch((e) => console.error(e));
  }, [events]);

  useEffect(() => {
    if (!isInitialized.current) return;
    db.tasks
      .clear()
      .then(() => db.tasks.bulkPut(tasks))
      .catch((e) => console.error(e));
  }, [tasks]);

  useEffect(() => {
    if (!isInitialized.current) return;
    db.categories
      .clear()
      .then(() => db.categories.bulkPut(categories))
      .catch((e) => console.error(e));
  }, [categories]);

  useEffect(() => {
    if (!isInitialized.current) return;
    db.tags
      .clear()
      .then(() => db.tags.bulkPut(tags))
      .catch((e) => console.error(e));
  }, [tags]);

  useEffect(() => {
    if (!isInitialized.current) return;
    if (view) dbOps.setSetting('view', view); // View is simple setting, not table
  }, [view]);

  // Note: 'view' was stored as setting but here I'm treating it as strict setting

  useEffect(() => {
    if (!isInitialized.current) return;
    dbOps.setSetting('darkMode', darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!isInitialized.current) return;
    db.taskViews
      .clear()
      .then(() => db.taskViews.bulkPut(taskViews))
      .catch((e) => console.error(e));
  }, [taskViews]);

  useEffect(() => {
    if (!isInitialized.current) return;
    dbOps.setSetting('activeTaskView', activeTaskView);
  }, [activeTaskView]);

  useEffect(() => {
    if (!isInitialized.current) return;
    dbOps.setSetting('pomodoroSettings', pomodoroSettings);
  }, [pomodoroSettings]);

  useEffect(() => {
    if (!isInitialized.current) return;
    dbOps.setSetting('icalUrl', icalUrl);
  }, [icalUrl]);

  useEffect(() => {
    if (!isInitialized.current) return;
    const snapshot = icalEvents.map(normalizeImportedCalendarEvent);
    icalEventsWriteQueueRef.current = icalEventsWriteQueueRef.current
      .catch(() => undefined)
      .then(() => dbOps.setImportedCalendarEvents(snapshot));
  }, [icalEvents]);

  useEffect(() => {
    if (!isInitialized.current) return;
    const snapshot = [...calendarSources];
    calendarSourcesWriteQueueRef.current = calendarSourcesWriteQueueRef.current
      .catch(() => undefined)
      .then(() => dbOps.setCalendarSources(snapshot));
  }, [calendarSources]);

  useEffect(() => {
    if (!isInitialized.current) return;
    dbOps.setFestivals(festivals as unknown as import('@/lib/db').FestivalEvent[]);
  }, [festivals]);

  useEffect(() => {
    if (!isInitialized.current) return;
    dbOps.setSetting('showFestivals', showFestivals);
  }, [showFestivals]);

  useEffect(() => {
    if (!isInitialized.current) return;
    dbOps.setSetting('festivalCountry', festivalCountry);
  }, [festivalCountry]);

  useEffect(() => {
    if (!isInitialized.current) return;
    dbOps.setSetting('festivalColor', festivalColor);
  }, [festivalColor]);

  // Persist habits to IndexedDB
  useEffect(() => {
    if (!isInitialized.current) return;
    db.habits
      .clear()
      .then(() => db.habits.bulkPut(habits))
      .catch((e) => console.error(e));
  }, [habits]);

  // Persist notes to IndexedDB
  useEffect(() => {
    if (!isInitialized.current) return;
    db.notes
      .clear()
      .then(() => db.notes.bulkPut(notes))
      .catch((e) => console.error(e));
  }, [notes]);

  useEffect(() => {
    if (!isInitialized.current) return;
    dbOps.setSearchDocuments(searchDocuments).catch((e) => console.error(e));
  }, [searchDocuments]);

  useEffect(() => {
    if (!isInitialized.current) return;
    dbOps.setMailAccounts(mailAccounts).catch((e) => console.error(e));
  }, [mailAccounts]);

  useEffect(() => {
    if (!isInitialized.current) return;
    dbOps.setMailThreads(mailThreads).catch((e) => console.error(e));
  }, [mailThreads]);

  useEffect(() => {
    if (!isInitialized.current) return;
    dbOps.setMailMessages(mailMessages).catch((e) => console.error(e));
  }, [mailMessages]);

  const refreshCalendarSource = useCallback(async (sourceId: string) => {
    const source = calendarSourcesRef.current.find((entry) => entry.id === sourceId);
    if (!source || !source.enabled) return;

    const response = await fetch('/api/fetch-ical', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: source.url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch iCal data' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const mappedEvents: ImportedCalendarEvent[] = (data.events || []).map(
      (event: ImportedCalendarEvent) =>
        normalizeImportedCalendarEvent({
          ...event,
          sourceId: source.id,
          sourceName: source.name,
          providerLabel: source.providerLabel,
          color: event.color || source.color,
          isImported: true,
        }),
    );

    setIcalEvents((prev) => {
      const remaining = prev.filter((event) => event.sourceId !== source.id);
      return [...remaining, ...mappedEvents];
    });

    setCalendarSources((prev) =>
      prev.map((entry) =>
        entry.id === source.id
          ? {
              ...entry,
              lastSyncedAt: new Date(),
              lastError: undefined,
            }
          : entry,
      ),
    );
  }, []);

  const refreshIcalEvents = useCallback(async () => {
    const sources = calendarSourcesRef.current;

    if (!sources.length) {
      setIcalEvents([]);
      return;
    }

    setIsLoadingIcal(true);

    try {
      const enabledSources = sources.filter((source) => source.enabled);
      for (const source of enabledSources) {
        await refreshCalendarSource(source.id);
      }

      toast.success(
        enabledSources.length > 1
          ? 'Calendars refreshed successfully'
          : 'Calendar imported successfully',
      );
    } catch (error) {
      console.error('Error fetching iCal data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import calendar');
    } finally {
      setIsLoadingIcal(false);
    }
  }, [refreshCalendarSource]);

  const setIcalUrl = useCallback((url: string | null) => {
    setIcalUrlState(url);

    if (!url) {
      setCalendarSources((prev) => prev.filter((source) => source.id !== 'legacy-ical-source'));
      setIcalEvents((prev) => prev.filter((event) => event.sourceId !== 'legacy-ical-source'));
      return;
    }

    setCalendarSources((prev) => {
      const existing = prev.find((source) => source.id === 'legacy-ical-source');
      if (existing) {
        return prev.map((source) =>
          source.id === 'legacy-ical-source'
            ? {
                ...source,
                url,
                enabled: true,
                updatedAt: new Date(),
              }
            : source,
        );
      }

      return [
        {
          id: 'legacy-ical-source',
          name: 'Imported calendar',
          url,
          providerLabel: 'Primary',
          color: '#2f6fed',
          enabled: true,
          kind: 'ical',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        ...prev,
      ];
    });
  }, []);

  useEffect(() => {
    if (calendarSources.length === 0) {
      if (icalUrl) {
        setIcalUrlState(null);
      }
      setIcalEvents([]);
      return;
    }

    const primarySource = calendarSources[0];
    if (primarySource?.url !== icalUrl) {
      setIcalUrlState(primarySource?.url || null);
    }
  }, [calendarSources, icalUrl]);

  const calendarAutoRefreshKey = useMemo(
    () =>
      calendarSources
        .filter((source) => source.enabled)
        .map((source) => `${source.id}:${source.url}:${source.enabled}`)
        .sort()
        .join('|'),
    [calendarSources],
  );

  useEffect(() => {
    if (calendarAutoRefreshKey) {
      refreshIcalEvents();
    }
  }, [calendarAutoRefreshKey, refreshIcalEvents]);

  // Function to fetch and refresh festivals
  const refreshFestivals = useCallback(async () => {
    setIsLoadingFestivals(true);

    try {
      const currentYear = new Date().getFullYear();
      const url = `/api/festivals?year=${currentYear}&countryCode=${festivalCountry}`;
      const response = await fetch(url);

      if (!response.ok) {
        // If we get a 404, it could be because the country isn't supported
        if (response.status === 404) {
          toast.error(`No holiday data available for ${festivalCountry}`);
          setFestivals([]);
        } else {
          throw new Error('Failed to fetch festival data');
        }
        return;
      }

      const data = await response.json();

      if (data.festivals && data.festivals.length > 0) {
        setFestivals(data.festivals);
        toast.success(`${data.festivals.length} holidays loaded for ${festivalCountry}`);
      } else {
        // Handle empty festivals data
        setFestivals([]);
        toast(`No holidays found for ${festivalCountry}`);
      }
    } catch (error) {
      console.error('Error fetching festival data:', error);
      toast.error('Failed to load festivals');
      setFestivals([]);
    } finally {
      setIsLoadingFestivals(false);
    }
  }, [festivalCountry]);

  // Fetch festivals when country changes or on initial load
  useEffect(() => {
    refreshFestivals();
  }, [festivalCountry, refreshFestivals]);

  useEffect(() => {
    const documents: GlobalSearchDocument[] = [
      ...events
        .filter((event) => !event.deletedAt)
        .map((event) => ({
          id: `event-${event.id}`,
          entityId: event.id,
          title: event.title,
          body: event.description,
          section: 'Calendar',
          type: 'event' as const,
          keywords: uniqueStrings([event.location || '', ...(event.tags || [])]),
          url: `/calendar?event=${event.id}&date=${new Date(event.start).toISOString().slice(0, 10)}`,
          updatedAt: new Date(event.end || event.start),
        })),
      ...icalEvents.map((event) => ({
        id: `imported-${event.id}`,
        entityId: event.id,
        title: event.title,
        body: event.description,
        section: event.sourceName || 'Imported calendar',
        type: 'imported-event' as const,
        keywords: uniqueStrings([
          event.location || '',
          event.providerLabel || '',
          event.sourceName || '',
        ]),
        url: `/calendar?event=${event.id}&date=${new Date(event.start).toISOString().slice(0, 10)}`,
        updatedAt: new Date(event.end || event.start),
      })),
      ...festivals.map((festival) => ({
        id: `festival-${festival.id}`,
        entityId: festival.id,
        title: festival.title,
        body: festival.description,
        section: 'Holidays',
        type: 'festival' as const,
        keywords: uniqueStrings([festivalCountry, festivalColor]),
        url: `/calendar?festival=${festival.id}&date=${new Date(festival.start).toISOString().slice(0, 10)}`,
        updatedAt: new Date(festival.start),
      })),
      ...tasks
        .filter((task) => !task.deletedAt)
        .map((task) => ({
          id: `task-${task.id}`,
          entityId: task.id,
          title: task.title,
          body: task.description,
          section: 'Tasks',
          type: 'task' as const,
          keywords: uniqueStrings([...(task.tags || []), task.priority]),
          url: `/tasks?task=${task.id}`,
          updatedAt: new Date(task.dueDate || task.date || Date.now()),
        })),
      ...notes
        .filter((note) => !note.deletedAt)
        .map((note) => ({
          id: `note-${note.id}`,
          entityId: note.id,
          title: note.title,
          body: sanitizeSearchBody(note.content),
          section: note.folder || 'Workspace',
          type: 'note' as const,
          keywords: uniqueStrings([...(note.tags || []), ...(note.linkedNoteTitles || [])]),
          url: `/notes?note=${note.id}`,
          updatedAt: new Date(note.updatedAt),
        })),
      ...habits
        .filter((habit) => !habit.deletedAt)
        .map((habit) => ({
          id: `habit-${habit.id}`,
          entityId: habit.id,
          title: habit.name,
          body: `${habit.frequency} habit`,
          section: 'Habits',
          type: 'habit' as const,
          keywords: uniqueStrings([habit.icon, habit.frequency]),
          url: `/habits?habit=${habit.id}`,
          updatedAt: new Date(habit.createdAt),
        })),
      ...taskViews.map((view) => ({
        id: `task-view-${view.id}`,
        entityId: view.id,
        title: view.name,
        body: 'Saved task view',
        section: 'Tasks',
        type: 'task-view' as const,
        keywords: uniqueStrings([view.sortBy, view.sortDirection]),
        url: `/tasks?view=${view.id}`,
        updatedAt: new Date(),
      })),
      ...calendarSources.map((source) => ({
        id: `calendar-source-${source.id}`,
        entityId: source.id,
        title: source.name,
        body: source.providerLabel || source.url,
        section: 'Settings',
        type: 'calendar-source' as const,
        keywords: uniqueStrings([source.kind, source.providerLabel || '', source.url]),
        url: `/settings#calendar-sources`,
        updatedAt: new Date(source.updatedAt),
      })),
      {
        id: 'command-new-task',
        entityId: 'new-task',
        title: 'Create task',
        body: 'Quick capture a new task',
        section: 'Commands',
        type: 'command',
        keywords: ['capture', 'task', 'new'],
        url: '/tasks?new=task',
        updatedAt: new Date(),
      },
      {
        id: 'command-new-event',
        entityId: 'new-event',
        title: 'Create event',
        body: 'Quick capture a new event',
        section: 'Commands',
        type: 'command',
        keywords: ['capture', 'event', 'new'],
        url: '/calendar?new=event',
        updatedAt: new Date(),
      },
      {
        id: 'command-new-note',
        entityId: 'new-note',
        title: 'Create note',
        body: 'Quick capture a new note',
        section: 'Commands',
        type: 'command',
        keywords: ['capture', 'note', 'new'],
        url: '/notes?new=note',
        updatedAt: new Date(),
      },
    ];

    setSearchDocuments(documents);
  }, [
    calendarSources,
    events,
    festivalColor,
    festivalCountry,
    festivals,
    habits,
    icalEvents,
    notes,
    tasks,
    taskViews,
  ]);

  const addCalendarSource = (
    source: Omit<CalendarSource, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncedAt' | 'lastError'>,
  ) => {
    const now = new Date();
    const newSource: CalendarSource = {
      ...source,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    setCalendarSources((prev) => [...prev, newSource]);
    if (!icalUrl) {
      setIcalUrlState(newSource.url);
    }
    return newSource.id;
  };

  const updateCalendarSource = (id: string, updates: Partial<CalendarSource>) => {
    setCalendarSources((prev) =>
      prev.map((source) =>
        source.id === id ? { ...source, ...updates, updatedAt: new Date() } : source,
      ),
    );
  };

  const removeCalendarSource = (id: string) => {
    const remainingSources = calendarSourcesRef.current.filter((source) => source.id !== id);
    setCalendarSources(remainingSources);
    setIcalUrlState(remainingSources[0]?.url || null);
    setIcalEvents((prev) => prev.filter((event) => event.sourceId !== id));
  };

  const toggleCalendarSource = (id: string, enabled: boolean) => {
    updateCalendarSource(id, { enabled });
    if (!enabled) {
      setIcalEvents((prev) => prev.filter((event) => event.sourceId !== id));
    }
  };

  // Event handlers
  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent = { ...event, id: uuidv4() };
    setEvents([...events, newEvent]);
  };

  const updateEvent = (id: string, updatedData: Partial<Event>) => {
    setEvents(events.map((event) => (event.id === id ? { ...event, ...updatedData } : event)));
  };

  const updateRecurringEventInstance = (
    eventId: string,
    occurrenceDate: string,
    updates: Partial<Event>,
  ) => {
    setEvents(
      events.map((event) => {
        if (event.id !== eventId || !event.recurring) return event;

        const exceptions = event.recurring.exceptions || [];
        const existingExceptionIndex = exceptions.findIndex((ex) => ex.date === occurrenceDate);

        const newException = {
          date: occurrenceDate,
          title: updates.title,
          description: updates.description,
          location: updates.location,
          start: updates.start,
          end: updates.end,
          color: updates.color,
          categoryId: updates.categoryId,
        };

        let updatedExceptions;
        if (existingExceptionIndex >= 0) {
          // Update existing exception
          updatedExceptions = [...exceptions];
          updatedExceptions[existingExceptionIndex] = {
            ...exceptions[existingExceptionIndex],
            ...newException,
          };
        } else {
          // Add new exception
          updatedExceptions = [...exceptions, newException];
        }

        return {
          ...event,
          recurring: {
            ...event.recurring,
            exceptions: updatedExceptions,
          },
        };
      }),
    );
  };

  const deleteRecurringEventInstance = (eventId: string, occurrenceDate: string) => {
    setEvents(
      events.map((event) => {
        if (event.id !== eventId || !event.recurring) return event;

        const exceptions = event.recurring.exceptions || [];
        const existingExceptionIndex = exceptions.findIndex((ex) => ex.date === occurrenceDate);

        let updatedExceptions;
        if (existingExceptionIndex >= 0) {
          // Mark existing exception as deleted
          updatedExceptions = [...exceptions];
          updatedExceptions[existingExceptionIndex] = {
            ...exceptions[existingExceptionIndex],
            deleted: true,
          };
        } else {
          // Add new exception marking this occurrence as deleted
          updatedExceptions = [...exceptions, { date: occurrenceDate, deleted: true }];
        }

        return {
          ...event,
          recurring: {
            ...event.recurring,
            exceptions: updatedExceptions,
          },
        };
      }),
    );
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  // Task handlers
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: uuidv4() };

    // Add regular task
    setTasks((prev) => [...prev, newTask]);

    return newTask.id;
  };

  const updateTask = (id: string, updatedData: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updatedData } : task)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const completeTask = (id: string, completed: boolean) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed } : task)));
    // Trigger confetti on task completion
    if (completed) {
      triggerConfetti();
    }
  };

  const updateTaskProgress = (id: string, progress: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, progress } : task)));
  };

  // Category handlers
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: uuidv4() };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (id: string, updatedData: Partial<Category>) => {
    setCategories(
      categories.map((category) =>
        category.id === id ? { ...category, ...updatedData } : category,
      ),
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((category) => category.id !== id));
  };

  // Tag handlers
  const addTag = (tag: Omit<Tag, 'id'>) => {
    const newTag = { ...tag, id: uuidv4() };
    setTags([...tags, newTag]);
  };

  const updateTag = (id: string, updatedData: Partial<Tag>) => {
    setTags(tags.map((tag) => (tag.id === id ? { ...tag, ...updatedData } : tag)));
  };

  const deleteTag = (id: string) => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

  // Dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // New Task Features

  const reorderTasks = (taskIds: string[]) => {
    // Update the order of each task
    taskIds.forEach((id, index) => {
      updateTask(id, { order: index });
    });
  };

  const duplicateTask = (taskId: string) => {
    const original = tasks.find((t) => t.id === taskId);
    if (!original) return '';

    // Use underscore prefix to indicate intentionally unused variable
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...taskWithoutId } = original;

    // Create new task with same properties but new ID
    const newTaskId = addTask({
      ...taskWithoutId,
      title: `${original.title} (Copy)`,
      completed: false,
    });

    return newTaskId;
  };

  const batchUpdateTasks = (taskIds: string[], updates: Partial<Task>) => {
    taskIds.forEach((id) => {
      updateTask(id, updates);
    });
  };

  const toggleTaskTemplate = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    updateTask(taskId, { isTemplate: !task.isTemplate });
  };

  const createTaskFromTemplate = (templateId: string) => {
    const template = tasks.find((t) => t.id === templateId && t.isTemplate);
    if (!template) return '';

    return duplicateTask(templateId);
  };

  // Task Views
  const addTaskView = (view: Omit<TaskView, 'id'>) => {
    const newView = { ...view, id: uuidv4() };
    setTaskViews((prev) => [...prev, newView]);
    return newView.id;
  };

  const updateTaskView = (id: string, updates: Partial<TaskView>) => {
    setTaskViews((prev) => prev.map((view) => (view.id === id ? { ...view, ...updates } : view)));
  };

  const deleteTaskView = (id: string) => {
    setTaskViews((prev) => prev.filter((view) => view.id !== id));

    // If the active view is deleted, set to the first available
    if (activeTaskView === id) {
      setActiveTaskView(taskViews.find((v) => v.id !== id)?.id || null);
    }
  };

  // Time Tracking
  const startTaskTimer = (taskId: string, timerType: 'regular' | 'pomodoro') => {
    setActiveTimerTaskId(taskId);
    setTimerStatus('running');
    setTimerType(timerType);

    if (timerType === 'pomodoro') {
      setTimerSessionType('work');
    }
  };

  const stopTaskTimer = (taskId: string) => {
    if (activeTimerTaskId === taskId) {
      setActiveTimerTaskId(null);
      setTimerStatus('stopped');
    }
  };

  const updateTaskTimeTracking = (taskId: string, timeTracking: Partial<TimeTracking>) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    updateTask(taskId, {
      timeTracking: {
        ...task.timeTracking,
        ...timeTracking,
      },
    });
  };

  const updatePomodoroSettings = (
    settings: Partial<{
      workMinutes: number;
      breakMinutes: number;
      longBreakMinutes: number;
      longBreakInterval: number;
    }>,
  ) => {
    setPomodoroSettings((prev) => ({
      ...prev,
      ...settings,
    }));
  };

  // Recurring Tasks
  const createNextRecurringTask = (taskId: string) => {
    const originalTask = tasks.find((t) => t.id === taskId);
    if (!originalTask || !originalTask.recurring) return;

    const { recurring, dueDate, date, ...taskProps } = originalTask;

    // Calculate the next occurrence date
    let nextDueDate: Date | undefined;
    let nextDate: Date | undefined;

    if (dueDate) {
      nextDueDate = calculateNextOccurrence(dueDate, recurring);
    }

    if (date) {
      nextDate = calculateNextOccurrence(date, recurring);
    }

    // Check if we should stop based on end date or occurrences
    if (recurring.endDate && nextDueDate && nextDueDate > new Date(recurring.endDate)) {
      return; // Don't create a new task if we've passed the end date
    }

    // Create the new recurring task
    addTask({
      ...taskProps,
      // id property is automatically generated by addTask
      title: originalTask.title,
      dueDate: nextDueDate,
      date: nextDate,
      completed: false,
      recurring: originalTask.recurring,
    });
  };

  // Calculate next occurrence based on recurring pattern
  const calculateNextOccurrence = (baseDate: Date, pattern: RecurringPattern): Date => {
    const nextDate = new Date(baseDate);

    switch (pattern.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + pattern.interval);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + pattern.interval * 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + pattern.interval);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + pattern.interval);
        break;
    }

    return nextDate;
  };

  // ============================================
  // Habit handlers
  // ============================================
  const addHabit = (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: uuidv4(),
      completedDates: [],
      createdAt: new Date(),
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const updateHabitHandler = (id: string, updates: Partial<Habit>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  const deleteHabitHandler = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const toggleHabitDate = (habitId: string, date: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const dates = h.completedDates.includes(date)
          ? h.completedDates.filter((d) => d !== date)
          : [...h.completedDates, date];
        return { ...h, completedDates: dates };
      }),
    );
  };

  // ============================================
  // Note handlers
  // ============================================
  const addNoteHandler = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote = normalizeNote({
      ...note,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setNotes((prev) => [...prev, newNote]);
    return newNote.id;
  };

  const updateNoteHandler = (id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? normalizeNote({ ...n, ...updates, updatedAt: new Date() }) : n,
      ),
    );
  };

  const deleteNoteHandler = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleNotePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? normalizeNote({ ...n, pinned: !n.pinned, updatedAt: new Date() }) : n,
      ),
    );
  };

  const archiveNote = (id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? normalizeNote({ ...note, archivedAt: new Date(), updatedAt: new Date() })
          : note,
      ),
    );
  };

  const restoreNote = (id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? normalizeNote({
              ...note,
              archivedAt: undefined,
              deletedAt: undefined,
              updatedAt: new Date(),
            })
          : note,
      ),
    );
  };

  const importMailBundle = (payload: string) => {
    const parsed = JSON.parse(payload) as {
      account?: Partial<InboxAccount>;
      threads?: Partial<MailThread>[];
      messages?: Partial<MailMessage>[];
    };

    const accountId = parsed.account?.id || uuidv4();
    const account: InboxAccount = {
      id: accountId,
      name: parsed.account?.name || 'Imported inbox',
      provider: parsed.account?.provider || 'local-import',
      emailAddress: parsed.account?.emailAddress,
      color: parsed.account?.color || '#2f6fed',
      connectedAt: parsed.account?.connectedAt ? new Date(parsed.account.connectedAt) : new Date(),
      lastImportedAt: new Date(),
      lastError: undefined,
      status: 'ready',
    };

    const messages: MailMessage[] = (parsed.messages || []).map((message, index) => ({
      id: message.id || uuidv4(),
      threadId: message.threadId || `thread-${index + 1}`,
      accountId,
      subject: message.subject || 'Imported message',
      from: message.from || 'Unknown sender',
      to: message.to || [],
      cc: message.cc || [],
      sentAt: message.sentAt ? new Date(message.sentAt) : new Date(),
      preview: message.preview || message.text || '',
      html: message.html,
      text: message.text,
      labels: message.labels || [],
      isRead: Boolean(message.isRead),
      isStarred: Boolean(message.isStarred),
    }));

    const threads: MailThread[] = (parsed.threads || []).map((thread, index) => {
      const threadMessages = messages.filter(
        (message) => message.threadId === (thread.id || `thread-${index + 1}`),
      );
      const latestMessage = [...threadMessages].sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
      )[0];

      return {
        id: thread.id || `thread-${index + 1}`,
        accountId,
        subject: thread.subject || latestMessage?.subject || 'Imported thread',
        participants:
          thread.participants ||
          uniqueStrings(threadMessages.flatMap((message) => [message.from, ...message.to])),
        preview: thread.preview || latestMessage?.preview || '',
        labels: thread.labels || [],
        latestMessageAt: thread.latestMessageAt
          ? new Date(thread.latestMessageAt)
          : new Date(latestMessage?.sentAt || Date.now()),
        unreadCount:
          thread.unreadCount ?? threadMessages.filter((message) => !message.isRead).length,
        isArchived: Boolean(thread.isArchived),
        isPinned: Boolean(thread.isPinned),
        messageIds: thread.messageIds || threadMessages.map((message) => message.id),
      };
    });

    setMailAccounts((prev) => [...prev.filter((entry) => entry.id !== account.id), account]);
    setMailMessages((prev) => [
      ...prev.filter((message) => message.accountId !== account.id),
      ...messages,
    ]);
    setMailThreads((prev) => [
      ...prev.filter((thread) => thread.accountId !== account.id),
      ...threads,
    ]);

    return { accountId: account.id, threadCount: threads.length };
  };

  const markMailThreadRead = (threadId: string, read: boolean) => {
    setMailThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? { ...thread, unreadCount: read ? 0 : Math.max(thread.unreadCount, 1) }
          : thread,
      ),
    );
    setMailMessages((prev) =>
      prev.map((message) =>
        message.threadId === threadId ? { ...message, isRead: read } : message,
      ),
    );
  };

  // ============================================
  // Subtask handlers
  // ============================================
  const addSubtask = (taskId: string, title: string) => {
    const newSubtask: Subtask = { id: uuidv4(), title, completed: false };
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, subtasks: [...(task.subtasks || []), newSubtask] } : task,
      ),
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subtasks: (task.subtasks || []).map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st,
          ),
        };
      }),
    );
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subtasks: (task.subtasks || []).filter((st) => st.id !== subtaskId),
        };
      }),
    );
  };

  // ============================================
  // Confetti
  // ============================================
  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  return (
    <AppContext.Provider
      value={{
        // Events
        events,
        addEvent,
        updateEvent,
        updateRecurringEventInstance,
        deleteRecurringEventInstance,
        deleteEvent,

        // Tasks
        tasks,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        updateTaskProgress,

        // New Task Features
        reorderTasks,
        duplicateTask,
        batchUpdateTasks,
        toggleTaskTemplate,
        createTaskFromTemplate,

        // Task Views
        taskViews,
        activeTaskView,
        addTaskView,
        updateTaskView,
        deleteTaskView,
        setActiveTaskView,

        // Time Tracking
        startTaskTimer,
        stopTaskTimer,
        updateTaskTimeTracking,
        activeTimerTaskId,
        timerStatus,
        timerType,
        timerSessionType,
        pomodoroSettings,
        updatePomodoroSettings,

        // Recurring Tasks
        createNextRecurringTask,

        // Categories
        categories,
        addCategory,
        updateCategory,
        deleteCategory,

        // Tags
        tags,
        addTag,
        updateTag,
        deleteTag,

        // Calendar View
        view,
        setView,

        // Dark Mode
        darkMode,
        toggleDarkMode,

        // iCal Integration
        icalUrl,
        icalEvents,
        setIcalUrl,
        refreshIcalEvents,
        calendarSources,
        addCalendarSource,
        updateCalendarSource,
        removeCalendarSource,
        toggleCalendarSource,
        refreshCalendarSource,
        isLoadingIcal,

        // Festivals
        festivals,
        showFestivals,
        festivalCountry,
        festivalColor,
        setShowFestivals,
        setFestivalCountry,
        setFestivalColor,
        refreshFestivals,
        isLoadingFestivals,
        availableCountries,

        // Habits
        habits,
        addHabit,
        updateHabit: updateHabitHandler,
        deleteHabit: deleteHabitHandler,
        toggleHabitDate,

        // Notes
        notes,
        addNote: addNoteHandler,
        updateNote: updateNoteHandler,
        deleteNote: deleteNoteHandler,
        toggleNotePin,
        archiveNote,
        restoreNote,

        // Search
        searchDocuments,

        // Inbox
        mailAccounts,
        mailThreads,
        mailMessages,
        importMailBundle,
        markMailThreadRead,

        // Subtasks
        addSubtask,
        toggleSubtask,
        deleteSubtask,

        // Confetti
        showConfetti,
        triggerConfetti,

        // Database loading state
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextProps => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
