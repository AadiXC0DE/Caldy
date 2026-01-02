'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as db from '@/lib/db';
import type { Event, Task, Category, Tag, TaskView } from '@/lib/types';
import type { FestivalEvent, ICalEvent } from '@/lib/db';

// ============================================
// Hook for IndexedDB-backed state
// ============================================
export function useIndexedDBState<T>(
  dbGetter: () => Promise<T[]>,
  dbSetter: (items: T[]) => Promise<void>,
  localStorageKey: string,
  defaultValue: T[]
): [T[], React.Dispatch<React.SetStateAction<T[]>>, boolean] {
  const [data, setData] = useState<T[]>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const isInitializing = useRef(true);

  // Load data from IndexedDB on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const items = await dbGetter();
        if (items.length > 0) {
          setData(items);
        }
      } catch (error) {
        console.error(`Error loading from IndexedDB (${localStorageKey}):`, error);
      } finally {
        setIsLoading(false);
        isInitializing.current = false;
      }
    };
    loadData();
  }, [dbGetter, localStorageKey]);

  // Save data to IndexedDB whenever it changes
  useEffect(() => {
    if (isInitializing.current) return;
    
    const saveData = async () => {
      try {
        await dbSetter(data);
      } catch (error) {
        console.error(`Error saving to IndexedDB (${localStorageKey}):`, error);
      }
    };
    saveData();
  }, [data, dbSetter, localStorageKey]);

  return [data, setData, isLoading];
}

// ============================================
// Hook for IndexedDB-backed settings
// ============================================
export function useIndexedDBSetting<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const isInitializing = useRef(true);

  // Load from IndexedDB on mount
  useEffect(() => {
    const loadSetting = async () => {
      try {
        const stored = await db.getSetting<T>(key);
        if (stored !== undefined) {
          setValue(stored);
        }
      } catch (error) {
        console.error(`Error loading setting ${key} from IndexedDB:`, error);
      } finally {
        setIsLoading(false);
        isInitializing.current = false;
      }
    };
    loadSetting();
  }, [key]);

  // Save to IndexedDB whenever value changes
  useEffect(() => {
    if (isInitializing.current) return;
    
    const saveSetting = async () => {
      try {
        await db.setSetting(key, value);
      } catch (error) {
        console.error(`Error saving setting ${key} to IndexedDB:`, error);
      }
    };
    saveSetting();
  }, [key, value]);

  const updateValue = useCallback((newValue: T) => {
    setValue(newValue);
  }, []);

  return [value, updateValue, isLoading];
}

// ============================================
// Database initializer hook
// ============================================
export function useIndexedDBInitializer(): boolean {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Attempt migration from localStorage
        await db.migrateFromLocalStorage();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
        // Fallback to localStorage if IndexedDB fails
        setIsInitialized(true);
      }
    };
    initialize();
  }, []);

  return isInitialized;
}

// ============================================
// Specific state hooks for each data type
// ============================================
export function useEventsDB(defaultValue: Event[]): [Event[], React.Dispatch<React.SetStateAction<Event[]>>, boolean] {
  const getEvents = useCallback(async () => db.getAllEvents(), []);
  const setEvents = useCallback(async (events: Event[]) => {
    await db.db.events.clear();
    await db.db.events.bulkPut(events);
  }, []);
  
  return useIndexedDBState(getEvents, setEvents, 'events', defaultValue);
}

export function useTasksDB(defaultValue: Task[]): [Task[], React.Dispatch<React.SetStateAction<Task[]>>, boolean] {
  const getTasks = useCallback(async () => db.getAllTasks(), []);
  const setTasks = useCallback(async (tasks: Task[]) => {
    await db.db.tasks.clear();
    await db.db.tasks.bulkPut(tasks);
  }, []);
  
  return useIndexedDBState(getTasks, setTasks, 'tasks', defaultValue);
}

export function useCategoriesDB(defaultValue: Category[]): [Category[], React.Dispatch<React.SetStateAction<Category[]>>, boolean] {
  const getCategories = useCallback(async () => db.getAllCategories(), []);
  const setCategories = useCallback(async (categories: Category[]) => {
    await db.db.categories.clear();
    await db.db.categories.bulkPut(categories);
  }, []);
  
  return useIndexedDBState(getCategories, setCategories, 'categories', defaultValue);
}

export function useTagsDB(defaultValue: Tag[]): [Tag[], React.Dispatch<React.SetStateAction<Tag[]>>, boolean] {
  const getTags = useCallback(async () => db.getAllTags(), []);
  const setTags = useCallback(async (tags: Tag[]) => {
    await db.db.tags.clear();
    await db.db.tags.bulkPut(tags);
  }, []);
  
  return useIndexedDBState(getTags, setTags, 'tags', defaultValue);
}

export function useTaskViewsDB(defaultValue: TaskView[]): [TaskView[], React.Dispatch<React.SetStateAction<TaskView[]>>, boolean] {
  const getTaskViews = useCallback(async () => db.getAllTaskViews(), []);
  const setTaskViews = useCallback(async (views: TaskView[]) => {
    await db.db.taskViews.clear();
    await db.db.taskViews.bulkPut(views);
  }, []);
  
  return useIndexedDBState(getTaskViews, setTaskViews, 'taskViews', defaultValue);
}

export function useICalEventsDB(defaultValue: Event[]): [Event[], React.Dispatch<React.SetStateAction<Event[]>>, boolean] {
  const getICalEvents = useCallback(async () => {
    const events = await db.getAllICalEvents();
    return events as unknown as Event[];
  }, []);
  const setICalEvents = useCallback(async (events: Event[]) => {
    await db.setICalEvents(events as unknown as ICalEvent[]);
  }, []);
  
  return useIndexedDBState(getICalEvents, setICalEvents, 'icalEvents', defaultValue);
}

export function useFestivalsDB(defaultValue: Event[]): [Event[], React.Dispatch<React.SetStateAction<Event[]>>, boolean] {
  const getFestivals = useCallback(async () => {
    const festivals = await db.getAllFestivals();
    return festivals as unknown as Event[];
  }, []);
  const setFestivals = useCallback(async (festivals: Event[]) => {
    await db.setFestivals(festivals as unknown as FestivalEvent[]);
  }, []);
  
  return useIndexedDBState(getFestivals, setFestivals, 'festivals', defaultValue);
}
