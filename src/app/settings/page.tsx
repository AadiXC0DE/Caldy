'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Calendar, RefreshCcw, Trash, Sparkles, Palette, Globe, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const { 
    icalUrl, 
    setIcalUrl, 
    refreshIcalEvents, 
    icalEvents, 
    isLoadingIcal,
    darkMode,
    toggleDarkMode,
    showFestivals,
    setShowFestivals,
    festivalCountry,
    setFestivalCountry,
    festivalColor,
    setFestivalColor,
    refreshFestivals,
    isLoadingFestivals,
    festivals
  } = useApp();
  
  const [inputUrl, setInputUrl] = useState(icalUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [countriesList, setCountriesList] = useState<{ countryCode: string; name: string }[]>([]);
  
  const [clientSideFestivalsCount, setClientSideFestivalsCount] = useState<number | null>(null);
  
  const fetchCountries = useCallback(async () => {
    if (countriesList.length > 0) return; 
    
    setIsLoadingCountries(true);
    try {
      const response = await fetch('/api/festival-countries');
      if (!response.ok) {
        throw new Error('Failed to fetch countries');
      }
      
      const data = await response.json();
      setCountriesList(data.countries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast.error('Failed to load countries list');
    } finally {
      setIsLoadingCountries(false);
    }
  }, [countriesList.length]);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (mounted) {
      setClientSideFestivalsCount(festivals?.length || 0);
    }
  }, [mounted, festivals?.length]);
  
  useEffect(() => {
    // Fetch countries list on initial load
    if (mounted) {
      fetchCountries();
    }
  }, [mounted, fetchCountries]);

  useEffect(() => {
    if (mounted) {
      setInputUrl(icalUrl || '');
      setClientSideFestivalsCount(festivals?.length || 0);
    }
  }, [icalUrl, festivals, mounted]);
  
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
      console.error('URL validation error:', error);
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
    <div className="container mx-auto max-w-6xl px-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
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

      {/* Main Settings Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Palette className="h-5 w-5 mr-2 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how your calendar looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark themes
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2"
                >
                  {!mounted ? (
                    "Dark Mode"
                  ) : darkMode ? (
                    <>
                      <Sun className="h-4 w-4" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      Dark Mode
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Show Festivals & Holidays</h3>
                  <p className="text-sm text-muted-foreground">
                    Display festivals and public holidays on your calendar
                  </p>
                </div>
                <Switch
                  checked={showFestivals}
                  onCheckedChange={setShowFestivals}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Festival & Holiday Settings */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Festival & Holiday Settings
              </CardTitle>
              <CardDescription>
                Configure how holidays appear in your calendar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-medium">Country/Region</Label>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={festivalCountry || 'US'}
                    onValueChange={(value) => {
                      setFestivalCountry(value);
                      // Also save to localStorage directly to ensure persistence
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('caldy-festival-country', value);
                      }
                    }}
                    disabled={isLoadingFestivals}
                    onOpenChange={(open) => {
                      if (open) fetchCountries();
                    }}
                  >
                    <SelectTrigger className="w-full">
                      {/* Only show content after mounting to prevent hydration mismatch */}
                      {mounted ? (
                        <SelectValue>
                          {(() => {
                            if (festivalCountry) {
                              const country = countriesList.find(c => c.countryCode === festivalCountry);
                              if (country) return country.name;
                              
                              const commonCountries: Record<string, string> = {
                                'US': 'United States',
                                'GB': 'United Kingdom',
                                'IN': 'India',
                                'CA': 'Canada',
                                'AU': 'Australia',
                                'SG': 'Singapore',
                                'AE': 'United Arab Emirates'
                              };
                              
                              return commonCountries[festivalCountry] || festivalCountry;
                            }
                            
                            return 'United States';
                          })()}
                        </SelectValue>
                      ) : (
                        <span className="opacity-0">Loading...</span>
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCountries ? (
                        <div className="flex items-center justify-center py-2">
                          <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                          Loading countries...
                        </div>
                      ) : countriesList.length > 0 ? (
                        countriesList.map(country => (
                          <SelectItem key={country.countryCode} value={country.countryCode}>
                            {country.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="IN">India</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                          <SelectItem value="SG">Singapore</SelectItem>
                          <SelectItem value="AE">United Arab Emirates</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">
                  Select your region to see relevant holidays
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="font-medium">Festival Color</Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: festivalColor }}
                  />
                  <Input
                    type="color"
                    value={festivalColor}
                    onChange={(e) => setFestivalColor(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={refreshFestivals}
                  disabled={isLoadingFestivals}
                  className="flex items-center gap-2"
                >
                  <RefreshCcw className={`h-4 w-4 ${isLoadingFestivals ? 'animate-spin' : ''}`} />
                  Refresh Holidays
                </Button>
                <div className="text-sm text-muted-foreground">
                  {mounted ? `${clientSideFestivalsCount} holidays loaded` : 'Loading...'}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* External Calendar Integration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="md:col-span-2"
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
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className="font-medium mb-1">Current iCal subscription</h3>
                      <p className="text-sm text-muted-foreground break-all mb-2">{icalUrl}</p>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
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
                  
                  <Separator className="my-3" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      Events:
                    </span>
                    <span>
                      {isLoadingIcal ? (
                        <Skeleton className="h-5 w-16" />
                      ) : (
                        <span className="font-medium">{icalEvents.length} imported</span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 