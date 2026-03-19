'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Cloud,
  Crown,
  HardDriveDownload,
  Shield,
  Sparkles,
  Waypoints,
  Zap,
} from 'lucide-react';

type PricingPlan = {
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  icon: React.ReactNode;
  popular: boolean;
  gradient: string;
  borderColor: string;
} & ({ href: string; priceId?: never } | { priceId: 'monthly' | 'lifetime'; href?: never });

const plans: PricingPlan[] = [
  {
    name: 'Free',
    description: 'Local-first, single-device planning with no account requirement.',
    price: '$0',
    period: 'forever',
    features: [
      'Calendar, tasks, notes, habits, planner, and focus mode',
      'Local-only storage on your device',
      'Export and import your workspace anytime',
      'No forced sync or account',
      'Best for focused single-device use',
    ],
    cta: 'Start Free',
    href: '/dashboard',
    icon: <Shield className="h-6 w-6" />,
    popular: false,
    gradient: 'from-slate-500/10 to-slate-600/5',
    borderColor: 'border-border',
  },
  {
    name: 'Pro Monthly',
    description: 'Add the privacy cloud without giving up the local-first model.',
    price: '$5',
    period: '/month',
    features: [
      'Everything in Free',
      'Encrypted cloud backup',
      'Sync across devices',
      'Restore on a new device',
      'Version history and premium workflow extras',
    ],
    cta: 'Upgrade to Pro',
    priceId: 'monthly',
    icon: <Zap className="h-6 w-6" />,
    popular: true,
    gradient: 'from-primary/12 to-primary/5',
    borderColor: 'border-primary/40',
  },
  {
    name: 'Pro Lifetime',
    description: 'Pay once for long-term continuity and premium access.',
    price: '$49',
    period: 'one-time',
    features: [
      'Everything in Pro Monthly',
      'Lifetime access to the privacy cloud tier',
      'Cross-device restore and backup',
      'Premium planner templates and insights',
      'One-time purchase instead of subscription',
    ],
    cta: 'Get Lifetime Pro',
    priceId: 'lifetime',
    icon: <Crown className="h-6 w-6" />,
    popular: false,
    gradient: 'from-amber-500/12 to-orange-500/5',
    borderColor: 'border-amber-500/35',
  },
];

const comparisonRows = [
  [
    'Storage model',
    'Local-only workspace on your device',
    'Local-first workspace plus encrypted backup',
  ],
  ['Device setup', 'Best for one device', 'Sync and restore across devices'],
  ['Recovery', 'Manual export/import', 'Version history and encrypted restore'],
  ['Core product', 'All core productivity features', 'Everything in Free'],
  [
    'Extras',
    'Focused single-device workflow',
    'Attachments sync, premium templates, advanced insights',
  ],
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] [background-size:72px_72px]" />

      <nav className="container relative z-10 mx-auto px-4 py-6">
        <div className="flex items-center justify-between rounded-2xl border bg-card/80 p-3 shadow-sm backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xl font-bold">Caldy</div>
              <div className="text-xs text-muted-foreground">Free local mode + optional Pro</div>
            </div>
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </nav>

      <div className="container relative z-10 mx-auto px-4 pb-24 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            <span>Pro pricing preview, coming soon</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Start free now. Pro is coming soon.
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Caldy is fully usable in free local mode today. This page is a preview of the planned
            Pro layer for backup, sync, restore, and recovery once it is ready to launch.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[2rem] border bg-card/80 p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4 text-primary" />
              How Free works
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Use Caldy locally without paying. Your workspace lives on your device and stays
              exportable at any time.
            </p>
          </div>
          <div className="rounded-[2rem] border bg-card/80 p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Cloud className="h-4 w-4 text-primary" />
              What Pro gives you
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Encrypted backup, sync, restore, version history, and premium workflow depth are
              planned here for people who want continuity across devices.
            </p>
          </div>
          <div className="rounded-[2rem] border bg-card/80 p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Waypoints className="h-4 w-4 text-primary" />
              Why pay if it is local-first?
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pro does not replace local storage. It layers an encrypted privacy cloud on top so
              your workspace can follow you when you want it to.
            </p>
          </div>
        </div>

        <div className="mt-12 grid max-w-6xl gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className={`relative flex flex-col rounded-[2rem] border ${plan.borderColor} bg-gradient-to-br ${plan.gradient} p-8 ${
                plan.popular ? 'scale-[1.02] shadow-xl ring-2 ring-primary/50' : 'shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-md">
                  Most popular
                </div>
              )}

              <div className="mb-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">{plan.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold">{plan.name}</h2>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </div>
                <div>
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="ml-1 text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {!plan.href && (
                <div className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Coming soon
                </div>
              )}

              {plan.href ? (
                <Button asChild variant="outline" className="w-full">
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              ) : (
                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'} disabled>
                  Pro coming soon
                </Button>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-16 overflow-hidden rounded-[2rem] border bg-card shadow-sm">
          <div className="grid border-b bg-muted/40 px-6 py-4 text-sm font-medium md:grid-cols-[0.9fr_1fr_1fr]">
            <div>Category</div>
            <div className="mt-2 md:mt-0">Free</div>
            <div className="mt-2 md:mt-0">Pro</div>
          </div>
          {comparisonRows.map(([label, freeValue, proValue]) => (
            <div
              key={label}
              className="grid gap-3 border-b px-6 py-5 text-sm last:border-b-0 md:grid-cols-[0.9fr_1fr_1fr]"
            >
              <div className="font-medium">{label}</div>
              <div className="text-muted-foreground">{freeValue}</div>
              <div className="text-muted-foreground">{proValue}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[2rem] border bg-card/85 p-8 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <HardDriveDownload className="h-5 w-5 text-primary" />
              What Free local mode includes
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                'A real single-device product with all core planning features',
                'Local storage on your device by default',
                'No forced signup or sync requirement',
                'Manual export and import for portability',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-8 shadow-xl">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Cloud className="h-5 w-5 text-primary" />
              What Pro syncs
            </div>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Your encrypted workspace backups, notes, tasks, events, habits, and planner data, plus
              the continuity features that make Caldy feel portable instead of disposable.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                'Cross-device backup and restore',
                'Workspace history and recovery',
                'Premium templates and advanced insights',
                'A clean account and billing surface when you want it',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
