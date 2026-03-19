'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Settings,
  Calendar,
  RefreshCcw,
  Trash,
  Sparkles,
  Palette,
  Globe,
  Moon,
  Sun,
  Download,
  Upload,
  Database,
  Crown,
  Cloud,
  CreditCard,
  Laptop,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@clerk/nextjs';
import * as dbOps from '@/lib/db';

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_'));

function SelfHostedAccountSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="md:col-span-2"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
            Local-First Mode
          </CardTitle>
          <CardDescription>
            This deployment is running without Clerk or Lemon Squeezy. Caldy works fully in free
            local mode, and your workspace stays on this device.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-4">
            <p className="text-sm font-semibold">Local workspace</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Calendar, tasks, notes, habits, planner, and exports all work without an account.
            </p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm font-semibold">Pro readiness</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add Clerk and Lemon Squeezy keys to enable optional sign-in, billing, and future
              privacy-cloud features.
            </p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm font-semibold">What stays local</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Export and import remain the source-of-truth backup workflow for this deployment.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ClerkAccountSection() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  const handleManageBilling = useCallback(async () => {
    setIsOpeningPortal(true);
    try {
      const response = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      window.location.href = data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to open billing portal');
    } finally {
      setIsOpeningPortal(false);
    }
  }, []);

  if (!isLoaded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="md:col-span-2"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
              Account & Pro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-28 w-full" />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!isSignedIn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="md:col-span-2"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
              Local-First Launch
            </CardTitle>
            <CardDescription>
              Caldy is shipping as a local-first product first. Accounts and Pro features can come
              later without changing how the core app works today.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border p-4">
                <p className="text-sm font-semibold">Free today</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your local workspace, calendar imports, and exports are all active right now.
                </p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-sm font-semibold">Pro later</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pro adds billing, account-linked restore, and the privacy-cloud layer when enabled
                  for this app.
                </p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-sm font-semibold">Data stays local</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Signing in does not turn Caldy into a cloud-first app. Local mode remains the
                  default.
                </p>
              </div>
            </div>
            <Button variant="outline" className="sm:w-auto" disabled>
              <Crown className="mr-2 h-4 w-4" />
              Pro coming soon
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const isPro = Boolean(user.publicMetadata?.hasAccess);
  const plan = (user.publicMetadata?.plan as string | undefined) || 'free';
  const planStatus = (user.publicMetadata?.planStatus as string | undefined) || 'local-only';
  const lemonCustomerId = user.publicMetadata?.lemonCustomerId as string | undefined;
  const lemonSubscriptionId = user.publicMetadata?.lemonSubscriptionId as string | undefined;
  const lemonOrderReceiptUrl = user.publicMetadata?.lemonOrderReceiptUrl as string | undefined;
  const planLabel = isPro ? (plan === 'lifetime' ? 'Pro Lifetime' : 'Pro Monthly') : 'Free Local';
  const canManageBilling = Boolean(lemonSubscriptionId || (lemonCustomerId && plan !== 'lifetime'));

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="md:col-span-2"
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center text-xl">
                {isPro ? (
                  <Crown className="mr-2 h-5 w-5 text-primary" />
                ) : (
                  <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
                )}
                Account & Pro
              </CardTitle>
              <CardDescription className="mt-1">
                Local mode remains your source of truth. Your account adds billing and prepares
                Caldy for privacy-cloud features without blocking the local experience.
              </CardDescription>
            </div>
            <Badge variant={isPro ? 'default' : 'secondary'}>{planLabel}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Laptop className="h-4 w-4 text-primary" />
                Local workspace
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Stored on this device, with export/import available from the Data Management section
                below.
              </p>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Cloud className="h-4 w-4 text-primary" />
                Privacy cloud
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Account-linked backup, restore, and sync surfaces are being prepared. This build
                keeps the UI honest while preserving free local mode.
              </p>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <LockKeyhole className="h-4 w-4 text-primary" />
                Billing status
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {isPro
                  ? `Plan active with status: ${planStatus}.`
                  : 'No paid plan is active for this account right now.'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="text-sm font-semibold">
              Signed in as {user.primaryEmailAddress?.emailAddress || 'your account'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isPro
                ? 'You have an active Pro plan. Manage billing below, and keep using Caldy locally while privacy-cloud features roll out.'
                : 'You are using Caldy in free local mode. Upgrade to Pro for billing-backed account features and the upcoming privacy-cloud layer.'}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {isPro && canManageBilling ? (
              <Button
                onClick={handleManageBilling}
                disabled={isOpeningPortal}
                className="sm:w-auto"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {isOpeningPortal ? 'Opening Billing…' : 'Manage Billing'}
              </Button>
            ) : isPro && plan === 'lifetime' && lemonOrderReceiptUrl ? (
              <Button asChild className="sm:w-auto">
                <a href={lemonOrderReceiptUrl} target="_blank" rel="noreferrer">
                  <CreditCard className="mr-2 h-4 w-4" />
                  View Receipt
                </a>
              </Button>
            ) : (
              <Button className="sm:w-auto" disabled>
                <Crown className="mr-2 h-4 w-4" />
                Pro coming soon
              </Button>
            )}

            <Button variant="outline" className="sm:w-auto" disabled>
              {isPro ? (
                <>
                  <Cloud className="mr-2 h-4 w-4" />
                  Pro details coming soon
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Pro coming soon
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AccountSectionCard() {
  if (!isClerkConfigured) {
    return <SelfHostedAccountSection />;
  }

  return <ClerkAccountSection />;
}

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
    festivals,
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

  const handleSaveIcalUrl = useCallback(async () => {
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
  }, [inputUrl, setIcalUrl]);

  const handleRemoveIcalUrl = useCallback(() => {
    setIcalUrl(null);
    setInputUrl('');
    toast.success('iCal subscription removed');
  }, [setIcalUrl]);

  const handleRefresh = useCallback(async () => {
    if (!icalUrl) {
      toast.error('No iCal URL configured');
      return;
    }

    await refreshIcalEvents();
  }, [icalUrl, refreshIcalEvents]);

  const handleUrlInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
  }, []);

  const handleFestivalColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFestivalColor(e.target.value);
    },
    [setFestivalColor],
  );

  const handleCountryChange = useCallback(
    (value: string) => {
      setFestivalCountry(value);
      // Also save to localStorage directly to ensure persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('caldy-festival-country', value);
      }
    },
    [setFestivalCountry],
  );

  // Effects
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

  const pageHeader = useMemo(
    () => (
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
            <p className="text-muted-foreground mt-1">Configure your calendar app preferences</p>
          </div>
        </div>
      </motion.div>
    ),
    [],
  );

  const countrySelectItems = useMemo(() => {
    if (isLoadingCountries) {
      return (
        <div className="flex items-center justify-center py-2">
          <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
          Loading countries...
        </div>
      );
    }

    if (countriesList.length > 0) {
      return countriesList.map((country) => (
        <SelectItem key={country.countryCode} value={country.countryCode}>
          {country.name}
        </SelectItem>
      ));
    }

    return (
      <>
        <SelectItem value="US">United States</SelectItem>
        <SelectItem value="GB">United Kingdom</SelectItem>
        <SelectItem value="IN">India</SelectItem>
        <SelectItem value="CA">Canada</SelectItem>
        <SelectItem value="AU">Australia</SelectItem>
        <SelectItem value="SG">Singapore</SelectItem>
        <SelectItem value="AE">United Arab Emirates</SelectItem>
      </>
    );
  }, [isLoadingCountries, countriesList]);

  const countryDisplayName = useMemo(() => {
    if (!festivalCountry) return 'United States';

    const country = countriesList.find((c) => c.countryCode === festivalCountry);
    if (country) return country.name;

    const commonCountries: Record<string, string> = {
      US: 'United States',
      GB: 'United Kingdom',
      IN: 'India',
      CA: 'Canada',
      AU: 'Australia',
      SG: 'Singapore',
      AE: 'United Arab Emirates',
    };

    return commonCountries[festivalCountry] || festivalCountry;
  }, [festivalCountry, countriesList]);

  const appearanceSection = useMemo(
    () => (
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
            <CardDescription>Customize how your calendar looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between rounded-lg border p-3 shadow-sm gap-3">
              <div className="space-y-0.5">
                <h3 className="font-medium">Dark Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <Button
                variant="outline"
                onClick={toggleDarkMode}
                className="flex items-center gap-2 w-full xs:w-auto"
              >
                {!mounted ? (
                  'Dark Mode'
                ) : darkMode ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span className="whitespace-nowrap">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span className="whitespace-nowrap">Dark Mode</span>
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
              <Switch checked={showFestivals} onCheckedChange={setShowFestivals} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ),
    [mounted, darkMode, toggleDarkMode, showFestivals, setShowFestivals],
  );

  const festivalSection = useMemo(
    () => (
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
            <CardDescription>Configure how holidays appear in your calendar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-medium">Country/Region</Label>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={festivalCountry || 'US'}
                  onValueChange={handleCountryChange}
                  disabled={isLoadingFestivals}
                  onOpenChange={(open) => {
                    if (open) fetchCountries();
                  }}
                >
                  <SelectTrigger className="w-full">
                    {/* Only show content after mounting to prevent hydration mismatch */}
                    {mounted ? (
                      <SelectValue>{countryDisplayName}</SelectValue>
                    ) : (
                      <span className="opacity-0">Loading...</span>
                    )}
                  </SelectTrigger>
                  <SelectContent>{countrySelectItems}</SelectContent>
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
                  onChange={handleFestivalColorChange}
                  className="w-full h-10"
                />
              </div>
            </div>

            <div className="pt-3 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
              <Button
                variant="outline"
                onClick={refreshFestivals}
                disabled={isLoadingFestivals}
                className="flex items-center gap-2 text-xs sm:text-sm w-full xs:w-auto"
              >
                <RefreshCcw
                  className={`h-4 w-4 ${isLoadingFestivals ? 'animate-spin' : ''} flex-shrink-0`}
                />
                <span className="whitespace-nowrap">Refresh Holidays</span>
              </Button>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {mounted ? `${clientSideFestivalsCount} holidays loaded` : 'Loading...'}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ),
    [
      mounted,
      festivalCountry,
      handleCountryChange,
      isLoadingFestivals,
      countryDisplayName,
      countrySelectItems,
      fetchCountries,
      festivalColor,
      handleFestivalColorChange,
      refreshFestivals,
      clientSideFestivalsCount,
    ],
  );

  const externalCalendarSection = useMemo(
    () => (
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
            <CardDescription>Connect to an external calendar using an iCal URL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Enter iCal URL (webcal:// or https://)"
                value={inputUrl}
                onChange={handleUrlInputChange}
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
                  <div className="flex flex-wrap xs:flex-nowrap gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRefresh}
                      disabled={isLoadingIcal}
                      className="flex-1 sm:flex-none text-xs sm:text-sm"
                    >
                      <RefreshCcw className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="whitespace-nowrap">Refresh</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRemoveIcalUrl}
                      className="flex-1 sm:flex-none text-xs sm:text-sm"
                    >
                      <Trash className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="whitespace-nowrap">Remove</span>
                    </Button>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="flex items-center justify-between">
                  <span className="flex items-center text-xs sm:text-sm">
                    <Calendar className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0 text-muted-foreground" />
                    Events:
                  </span>
                  <span className="text-xs sm:text-sm">
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
    ),
    [
      inputUrl,
      handleUrlInputChange,
      handleSaveIcalUrl,
      isSubmitting,
      mounted,
      icalUrl,
      handleRefresh,
      isLoadingIcal,
      handleRemoveIcalUrl,
      icalEvents.length,
    ],
  );

  return (
    <div className="container mx-auto max-w-6xl px-1">
      {pageHeader}

      {/* Main Settings Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {appearanceSection}
        {festivalSection}
        {externalCalendarSection}
        <AccountSectionCard />

        {/* Data Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-primary" />
                Data Management
              </CardTitle>
              <CardDescription>
                Export or import your local-first workspace. This remains the primary backup flow
                for free mode and self-hosted deployments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const data = await dbOps.exportAllData();
                      const blob = new Blob([JSON.stringify(data, null, 2)], {
                        type: 'application/json',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `caldy-backup-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success('Data exported successfully!');
                    } catch {
                      toast.error('Failed to export data');
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file) return;
                      try {
                        const text = await file.text();
                        const data = JSON.parse(text);
                        if (!data.data) {
                          toast.error('Invalid backup file');
                          return;
                        }
                        if (!confirm('This will replace ALL your current data. Are you sure?'))
                          return;
                        await dbOps.importAllData(data);
                        toast.success('Data imported! Refreshing...');
                        setTimeout(() => window.location.reload(), 1000);
                      } catch {
                        toast.error('Failed to import data');
                      }
                    };
                    input.click();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
