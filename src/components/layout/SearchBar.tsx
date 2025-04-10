'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, CheckSquare, Sparkles, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Event, Task } from '@/lib/types';

// Type for search results
type SearchResult = {
  id: string;
  title: string;
  type: 'event' | 'task' | 'festival';
  date?: Date;
  description?: string;
  url: string;
};

export function SearchBar() {
  const { events, tasks, festivals, icalEvents } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close the search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search function with improved relevance algorithm
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    // For single character searches, require exact word beginnings to reduce noise
    const isSingleChar = normalizedQuery.length === 1;
    
    // Calculate relevance score for an item
    const getRelevanceScore = (title: string, description?: string): number => {
      const normalizedTitle = title.toLowerCase();
      const normalizedDesc = description?.toLowerCase() || '';
      
      // Split query into words for better matching
      const queryWords = normalizedQuery.split(/\s+/);
      
      let score = 0;
      
      // Check for word beginnings in title (highest relevance)
      const titleWords = normalizedTitle.split(/\s+/);
      for (const titleWord of titleWords) {
        for (const queryWord of queryWords) {
          // Exact word match
          if (titleWord === queryWord) {
            score += 10;
          }
          // Word beginning match
          else if (titleWord.startsWith(queryWord)) {
            score += 5;
          }
          // Contains match (lowest score)
          else if (titleWord.includes(queryWord) && !isSingleChar) {
            score += 2;
          }
        }
      }
      
      // Check for matches in description (lower relevance)
      if (normalizedDesc) {
        const descWords = normalizedDesc.split(/\s+/);
        for (const descWord of descWords) {
          for (const queryWord of queryWords) {
            if (descWord === queryWord) {
              score += 3;
            }
            else if (descWord.startsWith(queryWord)) {
              score += 2;
            }
            else if (descWord.includes(queryWord) && !isSingleChar) {
              score += 1;
            }
          }
        }
      }
      
      // If it's a single character search and we have no significant matches, return 0
      if (isSingleChar && score < 5) {
        return 0;
      }
      
      return score;
    };

    // Search through regular events
    const eventResults = events
      .map((event: Event) => ({
        id: event.id,
        title: event.title,
        type: 'event' as const,
        date: new Date(event.start),
        description: event.description,
        url: `/calendar?event=${event.id}`,
        score: getRelevanceScore(event.title, event.description)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    // Search through iCal events
    const icalEventResults = icalEvents
      .map((event: Event) => ({
        id: event.id,
        title: event.title,
        type: 'event' as const,
        date: new Date(event.start),
        description: event.description,
        url: `/calendar?event=${event.id}`,
        score: getRelevanceScore(event.title, event.description)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    // Search through tasks
    const taskResults = tasks
      .map((task: Task) => ({
        id: task.id,
        title: task.title,
        type: 'task' as const,
        date: task.dueDate ? new Date(task.dueDate) : undefined,
        description: task.description,
        url: `/tasks?task=${task.id}`,
        score: getRelevanceScore(task.title, task.description)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    // Search through festivals
    const festivalResults = festivals
      .map((festival) => ({
        id: festival.id,
        title: festival.title,
        type: 'festival' as const,
        date: new Date(festival.start),
        description: festival.description,
        url: `/calendar?festival=${festival.id}`,
        score: getRelevanceScore(festival.title, festival.description)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    // Combine results, sort by score, then limit to 10 results
    const scoredResults = [...eventResults, ...icalEventResults, ...taskResults, ...festivalResults]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
      
    // Remove score property before setting results
    setResults(scoredResults.map(({ ...rest }) => rest));
  }, [events, tasks, festivals, icalEvents]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsOpen(true);
    performSearch(query);
    setFocusedIndex(-1);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      const selectedResult = results[focusedIndex];
      if (selectedResult) {
        handleResultClick(selectedResult);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Navigate to the correct page when clicking on a result
  const handleResultClick = (result: SearchResult) => {
    // Different handling based on result type
    if (result.type === 'event' || result.type === 'festival') {
      // For events and festivals, navigate to calendar and include the date
      const dateParam = result.date ? 
        `&date=${result.date.toISOString().split('T')[0]}` : 
        '';
        
      // Navigate to calendar with both item ID and date parameters
      router.push(`/calendar?${result.type}=${result.id}${dateParam}`);
    } 
    else if (result.type === 'task') {
      // For tasks, navigate to tasks page with the task ID
      router.push(`/tasks?task=${result.id}`);
    }
    
    // Close the search interface
    setIsOpen(false);
    setSearchQuery('');
    setResults([]);
  };

  // Get icon based on result type
  const getIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4 mr-2 text-primary" />;
      case 'task':
        return <CheckSquare className="h-4 w-4 mr-2 text-primary" />;
      case 'festival':
        return <Sparkles className="h-4 w-4 mr-2 text-primary" />;
      default:
        return null;
    }
  };

  // Focus the input when the search button is clicked
  const handleSearchFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setIsOpen(true);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex items-center rounded-full border w-full sm:w-[300px] lg:w-[280px] hover:border-primary/50 transition-colors">
        <Search 
          className="h-4 w-4 ml-3 text-muted-foreground " 
          onClick={handleSearchFocus}
        />
        <Input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onClick={() => setIsOpen(true)}
          placeholder="Search events, tasks, holidays..."
          className="border-0 focus-visible:ring-0 bg-transparent! focus-visible:ring-offset-0 h-9 text-sm"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 mr-1 hover:bg-muted rounded-full"
            onClick={clearSearch}
          >
            <X className="h-4 w-4 text-muted-foreground dark:text-white" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-[60vh] overflow-y-auto w-full sm:w-[320px] md:w-[350px]"
          >
            {results.map((result, index) => (
              <div
                key={`${result.type}-${result.id}`}
                className={cn(
                  "px-3 py-2 cursor-pointer hover:bg-muted flex items-start",
                  focusedIndex === index && "bg-muted"
                )}
                onClick={() => handleResultClick(result)}
              >
                <div className="flex-shrink-0 mt-1">{getIcon(result.type)}</div>
                <div className="flex-grow min-w-0">
                  <div className="font-medium text-sm truncate">{result.title}</div>
                  {result.date && (
                    <div className="text-xs text-muted-foreground">
                      {format(result.date, 'PP')}
                    </div>
                  )}
                  {result.description && (
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {result.description}
                    </div>
                  )}
                </div>
                <div className="ml-2 text-xs text-muted-foreground capitalize shrink-0">
                  {result.type}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 