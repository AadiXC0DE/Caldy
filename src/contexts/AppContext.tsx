import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Event, Task, Category, Tag, CalendarView } from '@/lib/types';
import { toast } from 'react-hot-toast';

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
  
  // iCal Integration
  icalUrl: string | null;
  icalEvents: Event[];
  setIcalUrl: (url: string | null) => void;
  refreshIcalEvents: () => Promise<void>;
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
    if (!storedValue) return defaultValue;
    
    // Parse the JSON and convert date strings back to Date objects
    const parsedValue = JSON.parse(storedValue, (key, value) => {
      // Check if the value looks like an ISO date string
      if (typeof value === 'string' && 
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
        return new Date(value);
      }
      return value;
    });
    
    return parsedValue;
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
  
  // Add iCal state
  const [icalUrl, setIcalUrl] = useState<string | null>(() => 
    loadFromStorage('caldy-ical-url', null)
  );
  const [icalEvents, setIcalEvents] = useState<Event[]>(() => 
    loadFromStorage('caldy-ical-events', [])
  );
  const [isLoadingIcal, setIsLoadingIcal] = useState(false);
  
  const [festivals, setFestivals] = useState<Event[]>(() => 
    loadFromStorage('caldy-festivals', [])
  );
  const [showFestivals, setShowFestivals] = useState<boolean>(() => 
    loadFromStorage('caldy-show-festivals', true)
  );
  const [festivalCountry, setFestivalCountry] = useState<string>(() => 
    loadFromStorage('caldy-festival-country', 'US')
  );
  const [festivalColor, setFestivalColor] = useState<string>(() => 
    loadFromStorage('caldy-festival-color', '#FF5722')
  );
  const [isLoadingFestivals, setIsLoadingFestivals] = useState(false);
  const [availableCountries, setAvailableCountries] = useState<{ countryCode: string; name: string }[]>([]);
  
  // Fetch available countries on initial load
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
  
  // Save iCal URL to localStorage
  useEffect(() => {
    saveToStorage('caldy-ical-url', icalUrl);
  }, [icalUrl]);
  
  // Save iCal events to localStorage
  useEffect(() => {
    saveToStorage('caldy-ical-events', icalEvents);
  }, [icalEvents]);
  
  // Save festival state to localStorage
  useEffect(() => {
    saveToStorage('caldy-festivals', festivals);
  }, [festivals]);
  
  useEffect(() => {
    saveToStorage('caldy-show-festivals', showFestivals);
  }, [showFestivals]);
  
  useEffect(() => {
    saveToStorage('caldy-festival-country', festivalCountry);
  }, [festivalCountry]);
  
  useEffect(() => {
    saveToStorage('caldy-festival-color', festivalColor);
  }, [festivalColor]);
  
  // Function to fetch and parse iCal events
  const refreshIcalEvents = useCallback(async () => {
    if (!icalUrl) {
      setIcalEvents([]);
      return;
    }
    
    setIsLoadingIcal(true);
    
    try {
      // Fetch iCal data from proxy to avoid CORS issues
      const response = await fetch('/api/fetch-ical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: icalUrl }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch iCal data');
      }
      
      const data = await response.json();
      setIcalEvents(data.events);
      toast.success('Calendar imported successfully');
    } catch (error) {
      console.error('Error fetching iCal data:', error);
      toast.error('Failed to import calendar');
      setIcalEvents([]);
    } finally {
      setIsLoadingIcal(false);
    }
  }, [icalUrl]);
  
  // Fetch iCal events when URL changes
  useEffect(() => {
    if (icalUrl) {
      refreshIcalEvents();
    }
  }, [icalUrl, refreshIcalEvents]);
  
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
      toggleDarkMode,
      icalUrl,
      icalEvents,
      setIcalUrl,
      refreshIcalEvents,
      isLoadingIcal,
      festivals,
      showFestivals,
      festivalCountry,
      festivalColor,
      setShowFestivals,
      setFestivalCountry,
      setFestivalColor,
      refreshFestivals,
      isLoadingFestivals,
      availableCountries
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