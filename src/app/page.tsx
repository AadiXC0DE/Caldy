'use client';

import React, { memo, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, type MotionValue, useMotionValue, useSpring } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Cloud,
  Database,
  Flame,
  FolderKanban,
  PanelsTopLeft,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Timer,
  Waypoints,
  Moon,
  NotebookPen,
} from 'lucide-react';

interface CursorProps {
  cursorXSpring: MotionValue<number>;
  cursorYSpring: MotionValue<number>;
}

interface GradientFollowerProps {
  mousePosition: { x: number; y: number };
}

const productPillars = [
  {
    icon: CalendarDays,
    title: 'Calendar for your schedule',
    description: 'Plan events, recurring routines, holidays, and imported calendars in one place.',
  },
  {
    icon: CheckSquare,
    title: 'Tasks for execution',
    description: 'Move from ideas to action with priorities, views, progress, and recurring work.',
  },
  {
    icon: NotebookPen,
    title: 'Notes for thinking and capture',
    description: 'Write, connect, and keep your daily knowledge beside your actual work.',
  },
  {
    icon: Flame,
    title: 'Habits for consistency',
    description: 'Track routines with a visual streak system that keeps momentum visible.',
  },
  {
    icon: Timer,
    title: 'Focus mode for deep work',
    description: 'Run Pomodoro sessions and tie your focus time back to real tasks.',
  },
  {
    icon: PanelsTopLeft,
    title: 'Planner for weekly structure',
    description: 'See the whole week and give your work an intentional place on the calendar.',
  },
];

const freeModeFeatures = [
  'Use Caldy locally without paying',
  'Your data stays on your device by default',
  'No forced sync or cloud lock-in',
  'Export and import your workspace anytime',
  'Best for a focused single-device setup',
];

const proFeatures = [
  'Encrypted cloud backup',
  'Sync across your devices',
  'Restore on a new laptop or browser',
  '30-day version history',
  'Attachment sync for notes',
  'Premium planner templates and advanced insights',
];

const faqItems = [
  {
    question: 'Do I need an account to use Caldy?',
    answer:
      'No. Free local mode works without an account. Sign in only when you want Pro features.',
  },
  {
    question: 'Where is my data stored?',
    answer:
      'On your device by default. Pro adds an encrypted privacy cloud for backup, sync, and recovery.',
  },
  {
    question: 'What does Pro sync?',
    answer:
      'Your encrypted workspace backups, notes, tasks, events, habits, and planner data across devices.',
  },
];

const productHighlights = [
  {
    eyebrow: 'Today flow',
    title: 'Capture, plan, and move into focus mode.',
    description:
      'Caldy turns scattered daily planning into one flow: note your idea, schedule the work, and execute it.',
    accent: 'from-primary/20 via-primary/10 to-background',
    items: ['Quick capture inbox', 'Task and event planning', 'Pomodoro focus sessions'],
  },
  {
    eyebrow: 'Notes and context',
    title: 'Keep ideas beside the work they belong to.',
    description:
      'Notes live next to tasks, events, and routines, so your thinking stays connected to execution.',
    accent: 'from-sky-500/20 via-cyan-500/10 to-background',
    items: ['Daily notes and references', 'Task and event context', 'Fast local search'],
  },
  {
    eyebrow: 'Privacy cloud',
    title: 'Upgrade when you need continuity, not surveillance.',
    description:
      'Pro adds encrypted backup, sync, and recovery without turning Caldy into a cloud-first system.',
    accent: 'from-emerald-500/20 via-primary/10 to-background',
    items: ['Cross-device continuity', 'Version history', 'Encrypted restore'],
  },
];

const CustomCursor = memo(({ cursorXSpring, cursorYSpring }: CursorProps) => {
  return (
    <motion.div
      className="pointer-events-none fixed z-50 hidden h-8 w-8 rounded-full border-2 border-primary mix-blend-difference md:block"
      style={{ x: cursorXSpring, y: cursorYSpring, willChange: 'transform' }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 0.35, scale: 1 }}
      transition={{ duration: 0.2 }}
    />
  );
});
CustomCursor.displayName = 'CustomCursor';

const GradientFollower = memo(({ mousePosition }: GradientFollowerProps) => {
  return (
    <div
      className="pointer-events-none fixed z-10 hidden h-[320px] w-[320px] rounded-full bg-gradient-to-r from-primary/12 to-sky-500/10 blur-3xl md:block"
      style={{
        left: mousePosition.x - 160,
        top: mousePosition.y - 160,
        transition: 'left 0.8s cubic-bezier(0.2, 1, 0.3, 1), top 0.8s cubic-bezier(0.2, 1, 0.3, 1)',
      }}
    />
  );
});
GradientFollower.displayName = 'GradientFollower';

const Spotlight = memo(({ mousePosition }: { mousePosition: { x: number; y: number } }) => {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition duration-300 lg:absolute"
      style={{
        background: `radial-gradient(560px at ${mousePosition.x}px ${mousePosition.y}px, rgba(var(--primary-rgb), 0.05), transparent 80%)`,
      }}
    />
  );
});
Spotlight.displayName = 'Spotlight';

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <Sparkles className="h-3 w-3" />
        <span>{eyebrow}</span>
      </div>
      <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">{title}</h2>
      <p className="text-lg leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorXSpring = useSpring(cursorX, { damping: 25, stiffness: 150, mass: 0.5 });
  const cursorYSpring = useSpring(cursorY, { damping: 25, stiffness: 150, mass: 0.5 });

  const throttle = useCallback(<T extends unknown[]>(func: (...args: T) => void, limit: number) => {
    let inThrottle = false;
    return function (this: unknown, ...args: T) {
      if (inThrottle) return;
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    };
  }, []);

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = throttle((event: MouseEvent) => {
      cursorX.set(event.clientX - 16);
      cursorY.set(event.clientY - 16);
      requestAnimationFrame(() => {
        setMousePosition({ x: event.clientX, y: event.clientY });
      });
    }, 10);

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY, throttle]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary/25">
      <CustomCursor cursorXSpring={cursorXSpring} cursorYSpring={cursorYSpring} />
      <Spotlight mousePosition={mousePosition} />
      <GradientFollower mousePosition={mousePosition} />

      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(var(--primary-rgb),0.14),transparent_48%)]" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] [background-size:72px_72px]" />

        <div className="container relative z-20 mx-auto px-4 pb-16 pt-4 sm:pb-24 sm:pt-12 lg:pb-32">
          <nav className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/75 p-3 shadow-sm backdrop-blur sm:mb-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xl font-bold">Caldy</div>
                <div className="text-xs text-muted-foreground">Local-first productivity</div>
              </div>
            </Link>

            <div className="hidden items-center gap-4 text-sm lg:flex">
              <Link href="#what-is-caldy" className="transition-colors hover:text-primary">
                Product
              </Link>
              <Link href="#free-vs-pro" className="transition-colors hover:text-primary">
                Free vs Pro
              </Link>
              <span className="hidden text-muted-foreground xl:inline">Pro coming soon</span>
              {mounted && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  className="relative overflow-hidden rounded-full"
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                    transition={{ duration: 0.45, type: 'spring' }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </motion.div>
                  <span className="sr-only">Toggle theme</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {mounted && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  className="relative mr-1 overflow-hidden rounded-full md:hidden"
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                    transition={{ duration: 0.45, type: 'spring' }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </motion.div>
                  <span className="sr-only">Toggle theme</span>
                </Button>
              )}
              <Button asChild className="hidden shadow-sm sm:inline-flex">
                <Link href="/dashboard">
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </nav>

          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="max-w-2xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <ShieldCheck className="h-3 w-3" />
                <span>Free local mode. Optional Pro privacy cloud.</span>
              </div>

              <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Caldy is your local-first daily operating system.
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Plan your day, manage tasks, write notes, build habits, and stay focused - with your
                data staying on your device by default.
              </p>

              <div className="mb-8 flex flex-wrap gap-4">
                <Button asChild size="lg" className="group shadow-lg">
                  <Link href="/dashboard">
                    Start Free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" disabled>
                  Pro coming soon
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border bg-card/70 p-4 backdrop-blur">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Database className="h-4 w-4 text-primary" />
                    Free local mode
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Use Caldy on one device with local storage, export/import, and no forced
                    account.
                  </p>
                </div>
                <div className="rounded-2xl border bg-card/70 p-4 backdrop-blur">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Cloud className="h-4 w-4 text-primary" />
                    Pro coming soon
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Encrypted backup, sync, restore, version history, and premium workflow extras
                    are on the roadmap and will land after the local-first launch.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -left-6 top-10 h-24 w-24 rounded-full bg-primary/15 blur-2xl" />
              <div className="absolute -bottom-10 right-8 h-28 w-28 rounded-full bg-sky-500/15 blur-2xl" />

              <div className="rounded-[2rem] border bg-card/85 p-4 shadow-2xl backdrop-blur-xl">
                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-[1.5rem] border bg-background/75 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Today</div>
                        <div className="text-2xl font-semibold">Thursday, March 19</div>
                      </div>
                      <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        Local by default
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-2xl border bg-primary/6 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-sm font-medium">Morning review</div>
                          <span className="text-xs text-muted-foreground">09:00</span>
                        </div>
                        <div className="text-xs leading-relaxed text-muted-foreground">
                          Review tasks, connect notes, and time-block the work that matters today.
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border bg-card p-4">
                          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                            <CheckSquare className="h-4 w-4 text-primary" />
                            Tasks
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <span>Finalize launch copy</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-muted-foreground/40" />
                              <span>Polish notes workspace</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-muted-foreground/40" />
                              <span>Write daily note</span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border bg-card p-4">
                          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                            <NotebookPen className="h-4 w-4 text-primary" />
                            Notes
                          </div>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="rounded-xl bg-muted/60 px-3 py-2">
                              Daily note: launch narrative
                            </div>
                            <div className="rounded-xl bg-muted/60 px-3 py-2">
                              Link pricing ideas to weekly review
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.5rem] border bg-background/75 p-5">
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                        <FolderKanban className="h-4 w-4 text-primary" />
                        Weekly planner
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="rounded-2xl border bg-card px-3 py-2">
                          Mon - notes cleanup and migration
                        </div>
                        <div className="rounded-2xl border bg-card px-3 py-2">
                          Tue - future Pro UX
                        </div>
                        <div className="rounded-2xl border bg-card px-3 py-2">
                          Wed - focus time and review
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border bg-gradient-to-br from-primary/10 via-card to-card p-5">
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                        <Cloud className="h-4 w-4 text-primary" />
                        Pro privacy cloud
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                          Coming soon
                        </span>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {[
                          'Encrypted backup',
                          'Restore on a new device',
                          'Sync notes, tasks, events, and habits',
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="relative z-20">
        <section id="what-is-caldy" className="py-24">
          <div className="container mx-auto px-4">
            <SectionHeading
              eyebrow="What is Caldy?"
              title="One workspace for planning, capture, and execution."
              description="Caldy combines the parts of a personal operating system that usually live in separate tools and keeps them close enough to actually work together."
            />

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {productPillars.map(({ icon: Icon, title, description }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  viewport={{ once: true }}
                  className="group rounded-3xl border bg-card/60 p-7 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/35"
                >
                  <div className="mb-5 inline-flex rounded-2xl bg-primary/10 p-3 text-primary transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted/35 py-24">
          <div className="container mx-auto px-4">
            <SectionHeading
              eyebrow="How Caldy fits into your day"
              title="Built to feel like one product, not six disconnected tools."
              description="The core experience is product-led: capture what matters, schedule it, keep the context nearby, and come back tomorrow with your momentum intact."
            />

            <div className="grid gap-6 lg:grid-cols-3">
              {productHighlights.map((highlight, index) => (
                <motion.div
                  key={highlight.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className={`overflow-hidden rounded-[2rem] border bg-gradient-to-br ${highlight.accent} p-[1px]`}
                >
                  <div className="h-full rounded-[calc(2rem-1px)] bg-card/90 p-7 backdrop-blur">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">
                      {highlight.eyebrow}
                    </div>
                    <h3 className="mb-4 text-2xl font-semibold tracking-tight">
                      {highlight.title}
                    </h3>
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      {highlight.description}
                    </p>
                    <ul className="space-y-3 text-sm">
                      {highlight.items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="free-vs-pro" className="py-24">
          <div className="container mx-auto px-4">
            <SectionHeading
              eyebrow="Free vs Pro"
              title="Free local mode first. Pro when you want continuity."
              description="Caldy does not bait-and-switch you into a cloud-first workflow. Free mode is a real product. Pro adds the privacy cloud on top."
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45 }}
                viewport={{ once: true }}
                className="rounded-[2rem] border bg-card/80 p-8 shadow-sm"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Free</div>
                    <h3 className="text-3xl font-bold">Local-only by design</h3>
                  </div>
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    No account required
                  </div>
                </div>
                <ul className="space-y-4">
                  {freeModeFeatures.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                      <span className="leading-relaxed text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                viewport={{ once: true }}
                className="rounded-[2rem] border border-primary/35 bg-gradient-to-br from-primary/12 via-card to-card p-8 shadow-xl"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Pro</div>
                    <h3 className="text-3xl font-bold">Privacy cloud upgrade</h3>
                  </div>
                  <div className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Coming soon
                  </div>
                </div>
                <ul className="space-y-4">
                  {proFeatures.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                      <span className="leading-relaxed text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              viewport={{ once: true }}
              className="mt-8 rounded-[2rem] border bg-muted/35 p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <Waypoints className="h-5 w-5 text-primary" />
                <h3 className="text-2xl font-semibold">Why pay if Caldy is local-first?</h3>
              </div>
              <p className="max-w-4xl text-lg leading-relaxed text-muted-foreground">
                Free mode keeps your data local. Pro does not replace that with a cloud-first
                system. Pro will add an encrypted privacy cloud so you can back up, sync, and
                recover your workspace when you want it.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="bg-primary/5 py-24">
          <div className="container mx-auto px-4">
            <SectionHeading
              eyebrow="Comparison"
              title="Know exactly what changes when you upgrade."
              description="Free is the best single-device setup. Pro is for people who want continuity, recovery, and premium workflow depth."
            />

            <div className="overflow-hidden rounded-[2rem] border bg-card shadow-sm">
              <div className="grid border-b bg-muted/40 px-6 py-4 text-sm font-medium md:grid-cols-[0.95fr_1fr_1fr]">
                <div>Capability</div>
                <div className="mt-2 md:mt-0">Free</div>
                <div className="mt-2 md:mt-0">Pro</div>
              </div>
              {[
                [
                  'Core productivity features',
                  'Calendar, tasks, notes, habits, planner, focus',
                  'Everything in Free',
                ],
                ['Storage model', 'Local-only on your device', 'Local-first plus encrypted backup'],
                ['Device support', 'Best on one device', 'Sync and restore across devices'],
                ['Recovery', 'Manual export/import', 'Version history and encrypted restore'],
                [
                  'Workflow extras',
                  'Core planning flow',
                  'Premium templates and advanced insights',
                ],
              ].map(([label, freeValue, proValue]) => (
                <div
                  key={label}
                  className="grid gap-3 border-b px-6 py-5 text-sm last:border-b-0 md:grid-cols-[0.95fr_1fr_1fr]"
                >
                  <div className="font-medium">{label}</div>
                  <div className="text-muted-foreground">{freeValue}</div>
                  <div className="text-muted-foreground">{proValue}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4">
            <SectionHeading
              eyebrow="FAQ"
              title="Short answers to the questions people ask first."
              description="The product should feel straightforward before anyone ever creates an account."
            />

            <div className="mx-auto grid max-w-4xl gap-4">
              {faqItems.map((item, index) => (
                <motion.div
                  key={item.question}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                  viewport={{ once: true }}
                  className="rounded-3xl border bg-card/70 p-6 backdrop-blur"
                >
                  <div className="mb-2 text-lg font-semibold">{item.question}</div>
                  <p className="leading-relaxed text-muted-foreground">{item.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.12),transparent_60%)]" />
          <div className="container relative z-10 mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              viewport={{ once: true }}
              className="mx-auto max-w-3xl rounded-[2.5rem] border bg-card/80 p-10 text-center shadow-xl backdrop-blur"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <RefreshCcw className="h-3 w-3" />
                <span>Start local. Upgrade only when you need continuity.</span>
              </div>
              <h2 className="mb-4 text-4xl font-bold tracking-tight">Take control of your day.</h2>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                Caldy gives you a focused workspace for planning, notes, and execution without
                turning your schedule into someone else&apos;s dataset.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="group shadow-lg">
                  <Link href="/dashboard">
                    Start Free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" disabled>
                  Pro coming soon
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="relative border-t py-10">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-70" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">Caldy</div>
                <div className="text-sm text-muted-foreground">
                  Local-first productivity for individuals
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <span>Pro coming soon</span>
              <span>Local-first launch</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
