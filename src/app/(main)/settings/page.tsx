'use client';

import React, { useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Calendar,
  Cloud,
  Download,
  Moon,
  Palette,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as dbOps from '@/lib/db';

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_'));

function AccountStateText() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <>
        <p className="mt-2 text-sm text-muted-foreground">Checking account state</p>
        <Badge variant="secondary" className="mt-3 rounded-full">
          Loading
        </Badge>
      </>
    );
  }

  return (
    <>
      <p className="mt-2 text-sm text-muted-foreground">
        {isSignedIn
          ? user?.primaryEmailAddress?.emailAddress || 'Signed in'
          : 'Running in local mode'}
      </p>
      <Badge variant="secondary" className="mt-3 rounded-full">
        {isSignedIn ? 'Account ready' : 'Local-first'}
      </Badge>
    </>
  );
}

function SettingsPageClient() {
  const {
    darkMode,
    toggleDarkMode,
    calendarSources,
    addCalendarSource,
    removeCalendarSource,
    updateCalendarSource,
    toggleCalendarSource,
    refreshCalendarSource,
    refreshIcalEvents,
    isLoadingIcal,
    icalEvents,
    showFestivals,
    setShowFestivals,
    festivalCountry,
    setFestivalCountry,
    festivalColor,
    setFestivalColor,
    refreshFestivals,
    isLoadingFestivals,
    festivals,
    availableCountries,
  } = useApp();
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceColor, setNewSourceColor] = useState('#2f6fed');
  const [isImporting, setIsImporting] = useState(false);

  const countryOptions = useMemo(
    () =>
      availableCountries.length
        ? availableCountries
        : [
            { countryCode: 'US', name: 'United States' },
            { countryCode: 'IN', name: 'India' },
            { countryCode: 'GB', name: 'United Kingdom' },
          ],
    [availableCountries],
  );

  const handleAddSource = () => {
    if (!newSourceUrl.trim()) {
      toast.error('Add a calendar URL first.');
      return;
    }

    try {
      new URL(newSourceUrl);
    } catch {
      toast.error('Use a valid `https://` or `webcal://` URL.');
      return;
    }

    addCalendarSource({
      name: newSourceName.trim() || `Calendar ${calendarSources.length + 1}`,
      url: newSourceUrl.trim(),
      providerLabel: 'External calendar',
      color: newSourceColor,
      enabled: true,
      kind: 'ical',
    });

    setNewSourceName('');
    setNewSourceUrl('');
    setNewSourceColor('#2f6fed');
    toast.success('Calendar source added');
  };

  const handleExport = async () => {
    const payload = await dbOps.exportAllData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `caldy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      await dbOps.importAllData(JSON.parse(text));
      toast.success('Backup imported. Reloading workspace...');
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import backup');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Tune the workspace, manage imported calendars, and keep your local-first data durable without turning the product into a cluttered control panel."
      />

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <Card className="rounded-[1.75rem] border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Trust and account
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border bg-card/70 p-4">
                <p className="font-medium">Local-first by default</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your workspace lives on this device first. Export remains your reliable backup
                  path today.
                </p>
              </div>
              <div className="rounded-2xl border bg-card/70 p-4">
                <p className="font-medium">Pro stays additive</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Pro is for continuity, encrypted backup, sync, and premium depth, not basic
                  usefulness.
                </p>
              </div>
              <div className="rounded-2xl border bg-card/70 p-4">
                <p className="font-medium">Current account state</p>
                {isClerkConfigured ? (
                  <AccountStateText />
                ) : (
                  <>
                    <p className="mt-2 text-sm text-muted-foreground">Running in local mode</p>
                    <Badge variant="secondary" className="mt-3 rounded-full">
                      Local-first
                    </Badge>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card id="calendar-sources" className="rounded-[1.75rem] border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Calendar sources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 md:grid-cols-[1fr_1.2fr_110px_auto]">
                <Input
                  value={newSourceName}
                  onChange={(event) => setNewSourceName(event.target.value)}
                  placeholder="Source name"
                  className="rounded-2xl"
                />
                <Input
                  value={newSourceUrl}
                  onChange={(event) => setNewSourceUrl(event.target.value)}
                  placeholder="https://calendar.example.com/feed.ics"
                  className="rounded-2xl"
                />
                <Input
                  type="color"
                  value={newSourceColor}
                  onChange={(event) => setNewSourceColor(event.target.value)}
                  className="h-11 rounded-2xl"
                />
                <Button onClick={handleAddSource} className="rounded-2xl">
                  Add source
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  {calendarSources.length} source{calendarSources.length === 1 ? '' : 's'}
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  {icalEvents.length} imported events
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshIcalEvents}
                  disabled={isLoadingIcal}
                  className="rounded-2xl"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh all
                </Button>
              </div>

              <div className="space-y-3">
                {calendarSources.length ? (
                  calendarSources.map((source) => (
                    <div key={source.id} className="rounded-[1.25rem] border bg-background/80 p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: source.color }}
                            />
                            <p className="truncate font-medium">{source.name}</p>
                            <Badge
                              variant={source.enabled ? 'secondary' : 'outline'}
                              className="rounded-full"
                            >
                              {source.enabled ? 'Enabled' : 'Paused'}
                            </Badge>
                          </div>
                          <p className="mt-2 truncate text-sm text-muted-foreground">
                            {source.url}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {source.lastSyncedAt
                              ? `Last refreshed ${new Date(source.lastSyncedAt).toLocaleString()}`
                              : 'Not refreshed yet'}
                            {source.lastError ? ` · ${source.lastError}` : ''}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Switch
                            checked={source.enabled}
                            onCheckedChange={(checked) => toggleCalendarSource(source.id, checked)}
                          />
                          <Input
                            type="color"
                            value={source.color}
                            onChange={(event) =>
                              updateCalendarSource(source.id, { color: event.target.value })
                            }
                            className="h-10 w-16 rounded-2xl"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refreshCalendarSource(source.id)}
                            className="rounded-2xl"
                          >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Refresh
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCalendarSource(source.id)}
                            className="rounded-2xl text-destructive hover:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
                    Add one or more iCal feeds to layer work, personal, and subscription calendars
                    into one view.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Holidays and festivals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 rounded-[1.35rem] border bg-card/70 p-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <Switch checked={showFestivals} onCheckedChange={setShowFestivals} />
                  <div className="min-w-0">
                    <p className="font-medium">Show public holidays</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Overlay a local holiday layer on the calendar so important public dates stay
                      visible without crowding the main schedule.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    {festivals.length} loaded
                  </Badge>
                  <Button
                    variant="outline"
                    onClick={refreshFestivals}
                    disabled={isLoadingFestivals}
                    className="rounded-2xl"
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_140px]">
                <div>
                  <Label>Country</Label>
                  <Select value={festivalCountry} onValueChange={setFestivalCountry}>
                    <SelectTrigger className="mt-2 rounded-2xl">
                      <SelectValue placeholder="Choose country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((country) => (
                        <SelectItem key={country.countryCode} value={country.countryCode}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Accent</Label>
                  <Input
                    type="color"
                    value={festivalColor}
                    onChange={(event) => setFestivalColor(event.target.value)}
                    className="mt-2 h-11 rounded-2xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="rounded-[1.75rem] border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5 text-primary" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border bg-card/70 p-4">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Keep the interface calm and readable across the day.
                  </p>
                </div>
                <Button variant="outline" onClick={toggleDarkMode} className="rounded-2xl">
                  {darkMode ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cloud className="h-5 w-5 text-primary" />
                Data durability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border bg-card/70 p-4 text-sm text-muted-foreground">
                Export keeps the current local-first product safe and portable. Import restores a
                backup into this browser profile.
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="outline" onClick={handleExport} className="rounded-2xl">
                  <Download className="mr-2 h-4 w-4" />
                  Export backup
                </Button>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border px-4 py-2 text-sm font-medium hover:bg-accent">
                  <Upload className="mr-2 h-4 w-4" />
                  {isImporting ? 'Importing...' : 'Import backup'}
                  <input
                    type="file"
                    accept="application/json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return <SettingsPageClient />;
}
