'use client';

import Dexie, { type Table } from 'dexie';
import type { Event, Task, Category, Tag, TaskView } from './types';

// Settings type for key-value storage
interface Settings {
  key: string;
  value: unknown;
}

// Festival event type
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

// iCal event type (stored separately)
interface ICalEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  description?: string;
  location?: string;
}

// Database class
class CaldyDatabase extends Dexie {
  events!: Table<Event, string>;
  tasks!: Table<Task, string>;
  categories!: Table<Category, string>;
  tags!: Table<Tag, string>;
  taskViews!: Table<TaskView, string>;
  settings!: Table<Settings, string>;
  icalEvents!: Table<ICalEvent, string>;
  festivals!: Table<FestivalEvent, string>;

  constructor() {
    super('CaldyDB');
    
    // Define database schema
    this.version(1).stores({
      events: 'id, start, end, categoryId',
      tasks: 'id, dueDate, completed, priority, categoryId',
      categories: 'id',
      tags: 'id',
      taskViews: 'id',
      settings: 'key',
      icalEvents: 'id',
      festivals: 'id'
    });
  }
}

// Create database instance
export const db = new CaldyDatabase();

// ============================================
// CRUD operations for Events
// ============================================
export async function getAllEvents(): Promise<Event[]> {
  return await db.events.toArray();
}

export async function addEvent(event: Event): Promise<string> {
  return await db.events.add(event);
}

export async function updateEvent(id: string, updates: Partial<Event>): Promise<number> {
  return await db.events.update(id, updates);
}

export async function deleteEvent(id: string): Promise<void> {
  await db.events.delete(id);
}

// ============================================
// CRUD operations for Tasks
// ============================================
export async function getAllTasks(): Promise<Task[]> {
  return await db.tasks.toArray();
}

export async function addTask(task: Task): Promise<string> {
  return await db.tasks.add(task);
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<number> {
  return await db.tasks.update(id, updates);
}

export async function deleteTask(id: string): Promise<void> {
  await db.tasks.delete(id);
}

// ============================================
// CRUD operations for Categories
// ============================================
export async function getAllCategories(): Promise<Category[]> {
  return await db.categories.toArray();
}

export async function addCategory(category: Category): Promise<string> {
  return await db.categories.add(category);
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<number> {
  return await db.categories.update(id, updates);
}

export async function deleteCategory(id: string): Promise<void> {
  await db.categories.delete(id);
}

// ============================================
// CRUD operations for Tags
// ============================================
export async function getAllTags(): Promise<Tag[]> {
  return await db.tags.toArray();
}

export async function addTag(tag: Tag): Promise<string> {
  return await db.tags.add(tag);
}

export async function updateTag(id: string, updates: Partial<Tag>): Promise<number> {
  return await db.tags.update(id, updates);
}

export async function deleteTag(id: string): Promise<void> {
  await db.tags.delete(id);
}

// ============================================
// CRUD operations for Task Views
// ============================================
export async function getAllTaskViews(): Promise<TaskView[]> {
  return await db.taskViews.toArray();
}

export async function addTaskView(taskView: TaskView): Promise<string> {
  return await db.taskViews.add(taskView);
}

export async function updateTaskView(id: string, updates: Partial<TaskView>): Promise<number> {
  return await db.taskViews.update(id, updates);
}

export async function deleteTaskView(id: string): Promise<void> {
  await db.taskViews.delete(id);
}

// ============================================
// Settings operations (key-value store)
// ============================================
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

// ============================================
// iCal Events operations
// ============================================
export async function getAllICalEvents(): Promise<ICalEvent[]> {
  return await db.icalEvents.toArray();
}

export async function setICalEvents(events: ICalEvent[]): Promise<void> {
  await db.transaction('rw', db.icalEvents, async () => {
    await db.icalEvents.clear();
    await db.icalEvents.bulkPut(events);
  });
}

// ============================================
// Festivals operations
// ============================================
export async function getAllFestivals(): Promise<FestivalEvent[]> {
  return await db.festivals.toArray();
}

export async function setFestivals(festivals: FestivalEvent[]): Promise<void> {
  await db.transaction('rw', db.festivals, async () => {
    await db.festivals.clear();
    await db.festivals.bulkPut(festivals);
  });
}

// ============================================
// Migration from localStorage
// ============================================
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

// Helper to parse dates from JSON
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

// Helper to load from localStorage
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
  // Check if already migrated
  const migrated = await getSetting<boolean>('migrated_from_localstorage');
  if (migrated) {
    return false; // Already migrated
  }
  
  console.log('Starting migration from localStorage to IndexedDB...');
  
  try {
    // Migrate events
    const events = loadFromLocalStorage<Event[]>(STORAGE_KEYS.events);
    if (events && events.length > 0) {
      await db.events.bulkPut(events);
      console.log(`Migrated ${events.length} events`);
    }
    
    // Migrate tasks
    const tasks = loadFromLocalStorage<Task[]>(STORAGE_KEYS.tasks);
    if (tasks && tasks.length > 0) {
      await db.tasks.bulkPut(tasks);
      console.log(`Migrated ${tasks.length} tasks`);
    }
    
    // Migrate categories
    const categories = loadFromLocalStorage<Category[]>(STORAGE_KEYS.categories);
    if (categories && categories.length > 0) {
      await db.categories.bulkPut(categories);
      console.log(`Migrated ${categories.length} categories`);
    }
    
    // Migrate tags
    const tags = loadFromLocalStorage<Tag[]>(STORAGE_KEYS.tags);
    if (tags && tags.length > 0) {
      await db.tags.bulkPut(tags);
      console.log(`Migrated ${tags.length} tags`);
    }
    
    // Migrate task views
    const taskViews = loadFromLocalStorage<TaskView[]>(STORAGE_KEYS.taskViews);
    if (taskViews && taskViews.length > 0) {
      await db.taskViews.bulkPut(taskViews);
      console.log(`Migrated ${taskViews.length} task views`);
    }
    
    // Migrate iCal events
    const icalEvents = loadFromLocalStorage<ICalEvent[]>(STORAGE_KEYS.icalEvents);
    if (icalEvents && icalEvents.length > 0) {
      await db.icalEvents.bulkPut(icalEvents);
      console.log(`Migrated ${icalEvents.length} iCal events`);
    }
    
    // Migrate festivals
    const festivals = loadFromLocalStorage<FestivalEvent[]>(STORAGE_KEYS.festivals);
    if (festivals && festivals.length > 0) {
      await db.festivals.bulkPut(festivals);
      console.log(`Migrated ${festivals.length} festivals`);
    }
    
    // Migrate settings
    const settings = [
      { key: 'icalUrl', storageKey: STORAGE_KEYS.icalUrl },
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
        console.log(`Migrated setting: ${key}`);
      }
    }
    
    // Mark as migrated
    await setSetting('migrated_from_localstorage', true);
    
    // Clear localStorage after successful migration
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Export type for use in other files
export type { FestivalEvent, ICalEvent };
