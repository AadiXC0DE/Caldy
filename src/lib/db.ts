'use client';

import Dexie, { type Table } from 'dexie';
import type {
  CalendarSource,
  Category,
  Event,
  GlobalSearchDocument,
  Habit,
  ImportedCalendarEvent,
  InboxAccount,
  MailMessage,
  MailThread,
  Note,
  Tag,
  Task,
  TaskView,
} from './types';

interface Settings {
  key: string;
  value: unknown;
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

class CaldyDatabase extends Dexie {
  events!: Table<Event, string>;
  tasks!: Table<Task, string>;
  categories!: Table<Category, string>;
  tags!: Table<Tag, string>;
  taskViews!: Table<TaskView, string>;
  settings!: Table<Settings, string>;
  icalEvents!: Table<ImportedCalendarEvent, string>;
  festivals!: Table<FestivalEvent, string>;
  habits!: Table<Habit, string>;
  notes!: Table<Note, string>;
  calendarSources!: Table<CalendarSource, string>;
  searchDocuments!: Table<GlobalSearchDocument, string>;
  mailAccounts!: Table<InboxAccount, string>;
  mailThreads!: Table<MailThread, string>;
  mailMessages!: Table<MailMessage, string>;

  constructor() {
    super('CaldyDB');

    this.version(1).stores({
      events: 'id, start, end, categoryId',
      tasks: 'id, dueDate, completed, priority, categoryId',
      categories: 'id',
      tags: 'id',
      taskViews: 'id',
      settings: 'key',
      icalEvents: 'id',
      festivals: 'id',
    });

    this.version(2).stores({
      events: 'id, start, end, categoryId',
      tasks: 'id, dueDate, completed, priority, categoryId',
      categories: 'id',
      tags: 'id',
      taskViews: 'id',
      settings: 'key',
      icalEvents: 'id',
      festivals: 'id',
      habits: 'id, createdAt',
      notes: 'id, pinned, createdAt, updatedAt',
    });

    this.version(3).stores({
      events: 'id, start, end, categoryId',
      tasks: 'id, dueDate, completed, priority, categoryId',
      categories: 'id',
      tags: 'id',
      taskViews: 'id',
      settings: 'key',
      icalEvents: 'id',
      festivals: 'id',
      habits: 'id, createdAt',
      notes:
        'id, pinned, createdAt, updatedAt, folder, isTemplate, isDailyNote, dailyNoteDate, *tags',
    });

    this.version(4)
      .stores({
        events: 'id, start, end, categoryId, archivedAt, deletedAt',
        tasks: 'id, dueDate, completed, priority, categoryId, archivedAt, deletedAt',
        categories: 'id',
        tags: 'id',
        taskViews: 'id',
        settings: 'key',
        icalEvents: 'id, sourceId, start, end',
        festivals: 'id',
        habits: 'id, createdAt, archivedAt, deletedAt',
        notes:
          'id, pinned, createdAt, updatedAt, folder, isTemplate, isDailyNote, dailyNoteDate, archivedAt, deletedAt, *tags',
        calendarSources: 'id, enabled, kind, lastSyncedAt',
        searchDocuments: 'id, type, entityId, updatedAt, *keywords',
        mailAccounts: 'id, provider, status, connectedAt',
        mailThreads: 'id, accountId, latestMessageAt, unreadCount, isArchived',
        mailMessages: 'id, threadId, accountId, sentAt, isRead, *labels',
      })
      .upgrade(async (tx) => {
        const settingsTable = tx.table<Settings, string>('settings');
        const sourceTable = tx.table<CalendarSource, string>('calendarSources');
        const importedTable = tx.table<ImportedCalendarEvent, string>('icalEvents');

        const existingSources = await sourceTable.toArray();
        const legacyIcalUrl = (await settingsTable.get('icalUrl'))?.value as string | undefined;

        if (legacyIcalUrl && existingSources.length === 0) {
          const now = new Date();
          const defaultSource: CalendarSource = {
            id: 'legacy-ical-source',
            name: 'Imported calendar',
            url: legacyIcalUrl,
            providerLabel: 'Legacy import',
            color: '#2f6fed',
            enabled: true,
            kind: 'ical',
            createdAt: now,
            updatedAt: now,
          };
          await sourceTable.put(defaultSource);

          const legacyEvents = await importedTable.toArray();
          await Promise.all(
            legacyEvents.map((event) =>
              importedTable.put({
                ...event,
                sourceId: event.sourceId || defaultSource.id,
                sourceName: event.sourceName || defaultSource.name,
                providerLabel: event.providerLabel || defaultSource.providerLabel,
                isImported: true,
              }),
            ),
          );
        }
      });
  }
}

export const db = new CaldyDatabase();

export async function getAllEvents(): Promise<Event[]> {
  return db.events.toArray();
}

export async function addEvent(event: Event): Promise<string> {
  return db.events.add(event);
}

export async function updateEvent(id: string, updates: Partial<Event>): Promise<number> {
  return db.events.update(id, updates);
}

export async function deleteEvent(id: string): Promise<void> {
  await db.events.delete(id);
}

export async function getAllTasks(): Promise<Task[]> {
  return db.tasks.toArray();
}

export async function addTask(task: Task): Promise<string> {
  return db.tasks.add(task);
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<number> {
  return db.tasks.update(id, updates);
}

export async function deleteTask(id: string): Promise<void> {
  await db.tasks.delete(id);
}

export async function getAllCategories(): Promise<Category[]> {
  return db.categories.toArray();
}

export async function addCategory(category: Category): Promise<string> {
  return db.categories.add(category);
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<number> {
  return db.categories.update(id, updates);
}

export async function deleteCategory(id: string): Promise<void> {
  await db.categories.delete(id);
}

export async function getAllTags(): Promise<Tag[]> {
  return db.tags.toArray();
}

export async function addTag(tag: Tag): Promise<string> {
  return db.tags.add(tag);
}

export async function updateTag(id: string, updates: Partial<Tag>): Promise<number> {
  return db.tags.update(id, updates);
}

export async function deleteTag(id: string): Promise<void> {
  await db.tags.delete(id);
}

export async function getAllTaskViews(): Promise<TaskView[]> {
  return db.taskViews.toArray();
}

export async function addTaskView(taskView: TaskView): Promise<string> {
  return db.taskViews.add(taskView);
}

export async function updateTaskView(id: string, updates: Partial<TaskView>): Promise<number> {
  return db.taskViews.update(id, updates);
}

export async function deleteTaskView(id: string): Promise<void> {
  await db.taskViews.delete(id);
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const setting = await db.settings.get(key);
  return setting?.value as T | undefined;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await db.settings.put({ key, value });
}

export async function deleteSetting(key: string): Promise<void> {
  await db.settings.delete(key);
}

export async function getAllImportedCalendarEvents(): Promise<ImportedCalendarEvent[]> {
  return db.icalEvents.toArray();
}

export async function setImportedCalendarEvents(events: ImportedCalendarEvent[]): Promise<void> {
  await db.transaction('rw', db.icalEvents, async () => {
    await db.icalEvents.clear();
    await db.icalEvents.bulkPut(events);
  });
}

export async function getAllICalEvents(): Promise<ImportedCalendarEvent[]> {
  return getAllImportedCalendarEvents();
}

export async function setICalEvents(events: ImportedCalendarEvent[]): Promise<void> {
  await setImportedCalendarEvents(events);
}

export async function getAllCalendarSources(): Promise<CalendarSource[]> {
  return db.calendarSources.toArray();
}

export async function setCalendarSources(sources: CalendarSource[]): Promise<void> {
  await db.transaction('rw', db.calendarSources, async () => {
    await db.calendarSources.clear();
    await db.calendarSources.bulkPut(sources);
  });
}

export async function getAllFestivals(): Promise<FestivalEvent[]> {
  return db.festivals.toArray();
}

export async function setFestivals(festivals: FestivalEvent[]): Promise<void> {
  await db.transaction('rw', db.festivals, async () => {
    await db.festivals.clear();
    await db.festivals.bulkPut(festivals);
  });
}

export async function getAllHabits(): Promise<Habit[]> {
  return db.habits.toArray();
}

export async function addHabit(habit: Habit): Promise<string> {
  return db.habits.add(habit);
}

export async function updateHabit(id: string, updates: Partial<Habit>): Promise<number> {
  return db.habits.update(id, updates);
}

export async function deleteHabit(id: string): Promise<void> {
  await db.habits.delete(id);
}

export async function getAllNotes(): Promise<Note[]> {
  return db.notes.toArray();
}

export async function addNote(note: Note): Promise<string> {
  return db.notes.add(note);
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<number> {
  return db.notes.update(id, updates);
}

export async function deleteNote(id: string): Promise<void> {
  await db.notes.delete(id);
}

export async function getAllSearchDocuments(): Promise<GlobalSearchDocument[]> {
  return db.searchDocuments.toArray();
}

export async function setSearchDocuments(documents: GlobalSearchDocument[]): Promise<void> {
  await db.transaction('rw', db.searchDocuments, async () => {
    await db.searchDocuments.clear();
    await db.searchDocuments.bulkPut(documents);
  });
}

export async function getAllMailAccounts(): Promise<InboxAccount[]> {
  return db.mailAccounts.toArray();
}

export async function setMailAccounts(accounts: InboxAccount[]): Promise<void> {
  await db.transaction('rw', db.mailAccounts, async () => {
    await db.mailAccounts.clear();
    await db.mailAccounts.bulkPut(accounts);
  });
}

export async function getAllMailThreads(): Promise<MailThread[]> {
  return db.mailThreads.toArray();
}

export async function setMailThreads(threads: MailThread[]): Promise<void> {
  await db.transaction('rw', db.mailThreads, async () => {
    await db.mailThreads.clear();
    await db.mailThreads.bulkPut(threads);
  });
}

export async function getAllMailMessages(): Promise<MailMessage[]> {
  return db.mailMessages.toArray();
}

export async function setMailMessages(messages: MailMessage[]): Promise<void> {
  await db.transaction('rw', db.mailMessages, async () => {
    await db.mailMessages.clear();
    await db.mailMessages.bulkPut(messages);
  });
}

export async function exportAllData(): Promise<Record<string, unknown>> {
  const [
    events,
    tasks,
    categories,
    tags,
    taskViews,
    settings,
    habits,
    notes,
    importedCalendarEvents,
    festivals,
    calendarSources,
    searchDocuments,
    mailAccounts,
    mailThreads,
    mailMessages,
  ] = await Promise.all([
    db.events.toArray(),
    db.tasks.toArray(),
    db.categories.toArray(),
    db.tags.toArray(),
    db.taskViews.toArray(),
    db.settings.toArray(),
    db.habits.toArray(),
    db.notes.toArray(),
    db.icalEvents.toArray(),
    db.festivals.toArray(),
    db.calendarSources.toArray(),
    db.searchDocuments.toArray(),
    db.mailAccounts.toArray(),
    db.mailThreads.toArray(),
    db.mailMessages.toArray(),
  ]);

  return {
    version: 3,
    exportedAt: new Date().toISOString(),
    data: {
      events,
      tasks,
      categories,
      tags,
      taskViews,
      settings,
      habits,
      notes,
      importedCalendarEvents,
      festivals,
      calendarSources,
      searchDocuments,
      mailAccounts,
      mailThreads,
      mailMessages,
    },
  };
}

export async function importAllData(importData: Record<string, unknown>): Promise<void> {
  const data = importData.data as Record<string, unknown[]>;
  if (!data) throw new Error('Invalid import data format');

  await db.transaction(
    'rw',
    [
      db.events,
      db.tasks,
      db.categories,
      db.tags,
      db.taskViews,
      db.settings,
      db.habits,
      db.notes,
      db.icalEvents,
      db.festivals,
      db.calendarSources,
      db.searchDocuments,
      db.mailAccounts,
      db.mailThreads,
      db.mailMessages,
    ],
    async () => {
      await Promise.all([
        db.events.clear(),
        db.tasks.clear(),
        db.categories.clear(),
        db.tags.clear(),
        db.taskViews.clear(),
        db.settings.clear(),
        db.habits.clear(),
        db.notes.clear(),
        db.icalEvents.clear(),
        db.festivals.clear(),
        db.calendarSources.clear(),
        db.searchDocuments.clear(),
        db.mailAccounts.clear(),
        db.mailThreads.clear(),
        db.mailMessages.clear(),
      ]);

      if (data.events?.length) await db.events.bulkPut(data.events as Event[]);
      if (data.tasks?.length) await db.tasks.bulkPut(data.tasks as Task[]);
      if (data.categories?.length) await db.categories.bulkPut(data.categories as Category[]);
      if (data.tags?.length) await db.tags.bulkPut(data.tags as Tag[]);
      if (data.taskViews?.length) await db.taskViews.bulkPut(data.taskViews as TaskView[]);
      if (data.settings?.length) await db.settings.bulkPut(data.settings as Settings[]);
      if (data.habits?.length) await db.habits.bulkPut(data.habits as Habit[]);
      if (data.notes?.length) await db.notes.bulkPut(data.notes as Note[]);
      if (data.importedCalendarEvents?.length) {
        await db.icalEvents.bulkPut(data.importedCalendarEvents as ImportedCalendarEvent[]);
      } else if (data.icalEvents?.length) {
        await db.icalEvents.bulkPut(data.icalEvents as ImportedCalendarEvent[]);
      }
      if (data.festivals?.length) await db.festivals.bulkPut(data.festivals as FestivalEvent[]);
      if (data.calendarSources?.length) {
        await db.calendarSources.bulkPut(data.calendarSources as CalendarSource[]);
      }
      if (data.searchDocuments?.length) {
        await db.searchDocuments.bulkPut(data.searchDocuments as GlobalSearchDocument[]);
      }
      if (data.mailAccounts?.length) {
        await db.mailAccounts.bulkPut(data.mailAccounts as InboxAccount[]);
      }
      if (data.mailThreads?.length) {
        await db.mailThreads.bulkPut(data.mailThreads as MailThread[]);
      }
      if (data.mailMessages?.length) {
        await db.mailMessages.bulkPut(data.mailMessages as MailMessage[]);
      }
    },
  );
}

const STORAGE_KEYS = {
  events: 'caldy-events',
  tasks: 'caldy-tasks',
  categories: 'caldy-categories',
  tags: 'caldy-tags',
  taskViews: 'caldy-task-views',
  icalUrl: 'caldy-ical-url',
  icalEvents: 'caldy-ical-events',
  darkMode: 'caldy-dark-mode',
  pomodoroSettings: 'caldy-pomodoro-settings',
  festivalCountry: 'caldy-festival-country',
  festivalColor: 'caldy-festival-color',
  showFestivals: 'caldy-show-festivals',
  festivals: 'caldy-festivals',
};

function parseDates<T>(data: T): T {
  if (typeof data !== 'object' || data === null) return data;

  if (Array.isArray(data)) {
    return data.map(parseDates) as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
      result[key] = new Date(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = parseDates(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

function loadFromLocalStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return parseDates(JSON.parse(stored));
  } catch {
    return null;
  }
}

export async function migrateFromLocalStorage(): Promise<boolean> {
  const migrated = await getSetting<boolean>('migrated_from_localstorage');
  if (migrated) {
    return false;
  }

  try {
    const events = loadFromLocalStorage<Event[]>(STORAGE_KEYS.events);
    if (events?.length) await db.events.bulkPut(events);

    const tasks = loadFromLocalStorage<Task[]>(STORAGE_KEYS.tasks);
    if (tasks?.length) await db.tasks.bulkPut(tasks);

    const categories = loadFromLocalStorage<Category[]>(STORAGE_KEYS.categories);
    if (categories?.length) await db.categories.bulkPut(categories);

    const tags = loadFromLocalStorage<Tag[]>(STORAGE_KEYS.tags);
    if (tags?.length) await db.tags.bulkPut(tags);

    const taskViews = loadFromLocalStorage<TaskView[]>(STORAGE_KEYS.taskViews);
    if (taskViews?.length) await db.taskViews.bulkPut(taskViews);

    const legacyIcalUrl = loadFromLocalStorage<string>(STORAGE_KEYS.icalUrl);
    const legacyIcalEvents = loadFromLocalStorage<ImportedCalendarEvent[]>(STORAGE_KEYS.icalEvents);
    if (legacyIcalUrl) {
      const now = new Date();
      const source: CalendarSource = {
        id: 'legacy-ical-source',
        name: 'Imported calendar',
        url: legacyIcalUrl,
        providerLabel: 'Migrated',
        color: '#2f6fed',
        enabled: true,
        kind: 'ical',
        createdAt: now,
        updatedAt: now,
      };
      await db.calendarSources.put(source);
      await setSetting('icalUrl', legacyIcalUrl);

      if (legacyIcalEvents?.length) {
        await db.icalEvents.bulkPut(
          legacyIcalEvents.map((event) => ({
            ...event,
            sourceId: event.sourceId || source.id,
            sourceName: event.sourceName || source.name,
            providerLabel: event.providerLabel || source.providerLabel,
            isImported: true,
          })),
        );
      }
    }

    const festivals = loadFromLocalStorage<FestivalEvent[]>(STORAGE_KEYS.festivals);
    if (festivals?.length) await db.festivals.bulkPut(festivals);

    const settings = [
      { key: 'darkMode', storageKey: STORAGE_KEYS.darkMode },
      { key: 'pomodoroSettings', storageKey: STORAGE_KEYS.pomodoroSettings },
      { key: 'festivalCountry', storageKey: STORAGE_KEYS.festivalCountry },
      { key: 'festivalColor', storageKey: STORAGE_KEYS.festivalColor },
      { key: 'showFestivals', storageKey: STORAGE_KEYS.showFestivals },
    ];

    for (const { key, storageKey } of settings) {
      const value = loadFromLocalStorage<unknown>(storageKey);
      if (value !== null) {
        await setSetting(key, value);
      }
    }

    await setSetting('migrated_from_localstorage', true);

    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });

    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export type ICalEvent = ImportedCalendarEvent;

export type { FestivalEvent, Settings };
