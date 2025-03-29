'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Calendar, RefreshCcw, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const { 
    icalUrl, 
    setIcalUrl, 
    refreshIcalEvents, 
    icalEvents, 
    isLoadingIcal,
    darkMode,
    toggleDarkMode
  } = useApp();
  
  const [inputUrl, setInputUrl] = useState(icalUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setInputUrl(icalUrl || '');
    }
  }, [icalUrl, mounted]);
  
  const handleSaveIcalUrl = async () => {
    if (!inputUrl) {
      toast.error('Please enter a valid iCal URL');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Validate URL format
      new URL(inputUrl);
      
      // Save the URL
      setIcalUrl(inputUrl);
      toast.success('iCal URL saved');
    } catch (error) {
      toast.error('Please enter a valid URL');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveIcalUrl = () => {
    setIcalUrl(null);
    setInputUrl('');
    toast.success('iCal subscription removed');
  };
  
  const handleRefresh = async () => {
    if (!icalUrl) {
      toast.error('No iCal URL configured');
      return;
    }
    
    await refreshIcalEvents();
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Settings className="h-8 w-8 mr-2 text-primary" />
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure your calendar app preferences
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              External Calendar Integration
            </CardTitle>
            <CardDescription>
              Connect to an external calendar using an iCal URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Enter iCal URL (webcal:// or https://)"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="flex-grow"
              />
              <Button 
                onClick={handleSaveIcalUrl} 
                disabled={isSubmitting}
                className="whitespace-nowrap"
              >
                {isSubmitting ? 'Saving...' : 'Save URL'}
              </Button>
            </div>
            
            {mounted && icalUrl && (
              <div className="rounded-lg border p-4 bg-muted/40">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Current iCal subscription</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRefresh}
                      disabled={isLoadingIcal}
                    >
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRemoveIcalUrl}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground break-all mb-2">{icalUrl}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {isLoadingIcal ? (
                      <Skeleton className="h-5 w-40" />
                    ) : (
                      <>
                        <span className="font-medium">{icalEvents.length}</span> events imported
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <h3 className="font-medium">Dark Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <Button variant="outline" onClick={toggleDarkMode}>
                {!mounted ? "Dark Mode" : darkMode ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 