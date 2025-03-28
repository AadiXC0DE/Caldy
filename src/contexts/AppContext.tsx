import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Event, Task, Category, Tag, Priority, CalendarView } from '@/lib/types';

interface AppContextProps {
  // Events
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string, completed: boolean) => void;
  updateTaskProgress: (id: string, progress: number) => void;
  
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

// Helper function to load data from localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Helper function to save data to localStorage
const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with data from localStorage or defaults
  const [events, setEvents] = useState<Event[]>(() => 
    loadFromStorage('caldy-events', [])
  );
  
  const [tasks, setTasks] = useState<Task[]>(() => 
    loadFromStorage('caldy-tasks', [])
  );
  
  const [categories, setCategories] = useState<Category[]>(() => 
    loadFromStorage('caldy-categories', defaultCategories)
  );
  
  const [tags, setTags] = useState<Tag[]>(() => 
    loadFromStorage('caldy-tags', defaultTags)
  );
  
  const [view, setView] = useState<CalendarView>(() => 
    loadFromStorage('caldy-view', 'month' as CalendarView)
  );
  
  const [darkMode, setDarkMode] = useState<boolean>(() => 
    loadFromStorage('caldy-dark-mode', false)
  );
  
  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveToStorage('caldy-events', events);
  }, [events]);
  
  useEffect(() => {
    saveToStorage('caldy-tasks', tasks);
  }, [tasks]);
  
  useEffect(() => {
    saveToStorage('caldy-categories', categories);
  }, [categories]);
  
  useEffect(() => {
    saveToStorage('caldy-tags', tags);
  }, [tags]);
  
  useEffect(() => {
    saveToStorage('caldy-view', view);
  }, [view]);
  
  useEffect(() => {
    saveToStorage('caldy-dark-mode', darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
  
  // Event handlers
  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent = { ...event, id: uuidv4() };
    setEvents([...events, newEvent]);
  };
  
  const updateEvent = (id: string, updatedData: Partial<Event>) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, ...updatedData } : event
    ));
  };
  
  const deleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
  };
  
  // Task handlers
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: uuidv4() };
    setTasks([...tasks, newTask]);
  };
  
  const updateTask = (id: string, updatedData: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updatedData } : task
    ));
  };
  
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const completeTask = (id: string, completed: boolean) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed } : task
    ));
  };
  
  const updateTaskProgress = (id: string, progress: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, progress } : task
    ));
  };
  
  // Category handlers
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: uuidv4() };
    setCategories([...categories, newCategory]);
  };
  
  const updateCategory = (id: string, updatedData: Partial<Category>) => {
    setCategories(categories.map(category => 
      category.id === id ? { ...category, ...updatedData } : category
    ));
  };
  
  const deleteCategory = (id: string) => {
    setCategories(categories.filter(category => category.id !== id));
  };
  
  // Tag handlers
  const addTag = (tag: Omit<Tag, 'id'>) => {
    const newTag = { ...tag, id: uuidv4() };
    setTags([...tags, newTag]);
  };
  
  const updateTag = (id: string, updatedData: Partial<Tag>) => {
    setTags(tags.map(tag => 
      tag.id === id ? { ...tag, ...updatedData } : tag
    ));
  };
  
  const deleteTag = (id: string) => {
    setTags(tags.filter(tag => tag.id !== id));
  };
  
  // Dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  return (
    <AppContext.Provider value={{
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      tasks,
      addTask,
      updateTask,
      deleteTask,
      completeTask,
      updateTaskProgress,
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      tags,
      addTag,
      updateTag,
      deleteTag,
      view,
      setView,
      darkMode,
      toggleDarkMode
    }}>
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