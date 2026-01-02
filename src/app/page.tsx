'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion, useMotionValue, useSpring, AnimatePresence, MotionValue } from 'framer-motion';
import { CalendarDays, CheckSquare, Palette, Moon, Sun, ArrowRight, BellRing, Repeat, ArrowDownUp, ShieldCheck, Database, UserX, Layout, Zap, Lock } from 'lucide-react';
import { useTheme } from 'next-themes';
import { TypewriterEffect } from '@/components/TypewriterEffect';

interface CursorProps {
  cursorXSpring: MotionValue<number>;
  cursorYSpring: MotionValue<number>;
}

interface GradientFollowerProps {
  mousePosition: { x: number; y: number };
}

const CustomCursor = memo(({ cursorXSpring, cursorYSpring }: CursorProps) => {
  return (
    <motion.div
      className="hidden md:block fixed w-8 h-8 rounded-full border-2 border-primary pointer-events-none z-50 mix-blend-difference"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        willChange: 'transform', // for browser optimization
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 0.4, scale: 1 }}
      transition={{ duration: 0.2 }}
    />
  );
});
CustomCursor.displayName = 'CustomCursor';

const GridBackgroundIcon = () => {
  return (
    <div className="relative w-6 h-6 flex items-center justify-center">
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 opacity-40">
        <div className="bg-primary rounded-[1px]"></div>
        <div className="bg-primary rounded-[1px] opacity-60"></div>
        <div className="bg-primary rounded-[1px] opacity-60"></div>
        <div className="bg-primary rounded-[1px] opacity-30"></div>
      </div>
    </div>
  );
};
GridBackgroundIcon.displayName = 'GridBackgroundIcon';

const GradientFollower = memo(({ mousePosition }: GradientFollowerProps) => {
  return (
    <div 
      className="hidden md:block fixed w-[300px] h-[300px] rounded-full bg-gradient-to-r from-primary/10 to-primary/5 blur-3xl pointer-events-none z-10 opacity-40"
      style={{
        left: mousePosition.x - 150,
        top: mousePosition.y - 150,
        transition: 'left 0.8s cubic-bezier(0.2, 1, 0.3, 1), top 0.8s cubic-bezier(0.2, 1, 0.3, 1)',
        willChange: 'transform, left, top', // for browser optimization
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
        background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(var(--primary-rgb), 0.05), transparent 80%)`,
      }}
    />
  );
});
Spotlight.displayName = 'Spotlight';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeDay, setActiveDay] = useState(15); // Default to "today" in the demo
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const throttle = useCallback(
    <T extends unknown[]>(func: (...args: T) => void, limit: number) => {
      let inThrottle: boolean;
      return function(this: unknown, ...args: T) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }, 
  []);

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = throttle((e: MouseEvent) => {
      cursorX.set(e.clientX - 16); 
      cursorY.set(e.clientY - 16);
      
      requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
    }, 10); // Throttle to every 10ms
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [throttle, cursorX, cursorY]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-primary/30">
      <CustomCursor cursorXSpring={cursorXSpring} cursorYSpring={cursorYSpring} />
      
      <Spotlight mousePosition={mousePosition} />
      <GradientFollower mousePosition={mousePosition} />
      
      {/* Hero Section */}
      <header className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden bg-background text-foreground">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        <div className="container mx-auto px-4 pt-10 pb-20 sm:pt-20 sm:pb-32 relative z-10">
          <nav className="flex items-center justify-between mb-16 rounded-xl border p-3 bg-card/80 backdrop-blur-sm shadow-sm">
            <div className="flex items-center">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <CalendarDays className="h-7 w-7 mr-2 text-primary" />
              </motion.div>
              <span className="text-2xl font-bold">Caldy</span>
            </div>
            <div className="hidden sm:flex space-x-6 items-center">
              <Link href="/calendar" className="hover:text-primary transition-colors flex items-center gap-1 group">
                <CalendarDays className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="relative">
                  Calendar
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </span>
              </Link>
              <Link href="/tasks" className="hover:text-primary transition-colors flex items-center gap-1 group">
                <CheckSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="relative">
                  Tasks
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </span>
              </Link>
              {mounted && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  className="rounded-full relative overflow-hidden"
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {theme === 'dark' ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Sun className="h-5 w-5" />
                    )}
                  </motion.div>
                  <span className="sr-only">Toggle dark mode</span>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {mounted && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  className="rounded-full sm:hidden mr-2 relative overflow-hidden"
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {theme === 'dark' ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Sun className="h-5 w-5" />
                    )}
                  </motion.div>
                </Button>
              )}
              <Button asChild variant="default" className="shadow-sm">
                <Link href="/calendar">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </nav>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6 backdrop-blur-md"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Privacy-First & Completely Local</span>
              </motion.div>
              <TypewriterEffect
                className="mb-6 tracking-tight"
                words={[
                  { text: "Privacy-focused" },
                  { text: "Calendar", className: "text-primary" },
                  { text: "&" },
                  { text: "Tasks," },
                  { text: "Stored" },
                  { text: "Locally" },
                ]}
              />
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                The simple, beautiful way to manage your life. No signups, no trackers, no cloud. Your data stays on your device, exactly where it belongs.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="shadow-lg relative overflow-hidden group">
                  <Link href="/calendar">
                    <span className="relative z-10">Start Planning Now</span>
                    <motion.div 
                      className="absolute inset-0 bg-primary-foreground/10 z-0" 
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="group relative overflow-hidden">
                  <Link href="#privacy">
                    <span className="relative z-10 group-hover:text-primary transition-colors">Why Privacy?</span>
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-0" 
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-full aspect-square md:aspect-[4/3] rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-1 shadow-xl">
                <div className="h-full w-full rounded-lg bg-card overflow-hidden border shadow-sm">
                  <div className="bg-primary/10 p-4 flex items-center justify-between border-b">
                    <div className="flex items-center">
                      <motion.div 
                        animate={{ rotate: [0, 0, 5, 0, -5, 0] }} 
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                      >
                        <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                      </motion.div>
                      <span className="font-medium">Calendar View</span>
                    </div>
                    <div className="flex space-x-2">
                      <motion.div 
                        className="h-3 w-3 rounded-full bg-green-200 dark:bg-accent"
                        whileHover={{ scale: 1.2 }}
                      ></motion.div>
                      <motion.div 
                        className="h-3 w-3 rounded-full bg-purple-200 dark:bg-purple-800"
                        whileHover={{ scale: 1.2 }}
                      ></motion.div>
                      <motion.div 
                        className="h-3 w-3 rounded-full bg-primary dark:bg-primary"
                        whileHover={{ scale: 1.2 }}
                      ></motion.div>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 text-center text-xs font-medium py-2 border-b">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                      <motion.div 
                        key={day} 
                        className="py-1"
                        whileHover={{ scale: 1.15, color: 'var(--primary)' }}
                        transition={{ duration: 0.2 }}
                      >
                        {day}
                      </motion.div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 text-center text-sm">
                    {Array.from({ length: 35 }).map((_, i) => {
                      const isCurrentMonth = i >= 4 && i < 34;
                      const isToday = i === 15;
                      const hasEvent = [10, 15, 27].includes(i);
                      const specialEvent = i === 10 ? "Meeting with Team" : 
                                          i === 15 ? "Lunch with Client" : 
                                          i === 27 ? "Doctor's Appointment" : "";
                      const isHovered = activeDay === i;
                      
                      return (
                        <motion.div 
                          key={i} 
                          className={`py-2 relative cursor-pointer ${isCurrentMonth ? '' : 'text-muted-foreground/40'} ${isToday ? '' : ''}`}
                          onHoverStart={() => setActiveDay(i)}
                          whileHover={{ scale: (hasEvent && isHovered) || isToday ? 1 : 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.span 
                            className={`flex items-center justify-center h-8 w-8 mx-auto ${isToday ? 'bg-primary text-primary-foreground rounded-full' : ''}`}
                            animate={isToday ? { 
                              scale: [1, 1.05, 1], 
                              boxShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 0px 8px rgba(var(--primary-rgb), 0.5)", "0px 0px 0px rgba(0,0,0,0)"]
                            } : {}}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                          >
                            {i - 4 <= 0 ? i + 27 : i - 4 > 30 ? i - 34 : i - 4}
                          </motion.span>
                          {hasEvent && (
                            <>
                              <motion.div 
                                className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1.5 w-1.5 rounded-full ${
                                  i === 15 ? 'bg-primary' : 
                                  i === 10 ? 'bg-accent' : 
                                  i === 22 ? 'bg-secondary' : 
                                  'bg-chart-5'
                                }`}
                                whileHover={{ scale: 1.5 }}
                                animate={isHovered ? { scale: [1, 1.4, 1] } : {}}
                                transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
                              ></motion.div>
                              <AnimatePresence>
                                {(isHovered || i === 15) && (
                                  <motion.div 
                                    className="absolute top-full left-0 right-0 z-[100] bg-card p-2 rounded-md shadow-lg border text-xs text-left mr-1 ml-1 mt-1"
                                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <div className="font-medium text-[9px] sm:text-xs">{specialEvent}</div>
                                    <div className="text-muted-foreground text-[8px] sm:text-[10px]">12:00 PM - 1:30 PM</div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Add floating decoration elements with animation */}
              <motion.div 
                className="absolute -top-6 -right-6 h-12 w-12 rounded-lg bg-accent/20 rotate-12"
                animate={{ 
                  rotate: [12, 15, 10, 15, 12],
                  y: [0, -5, 0, -3, 0] 
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              ></motion.div>
              <motion.div 
                className="absolute -bottom-6 -left-6 h-12 w-12 rounded-lg bg-primary/20 -rotate-12"
                animate={{ 
                  rotate: [-12, -8, -15, -10, -12],
                  y: [0, 5, 0, 3, 0] 
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              ></motion.div>
              
              {/* Add new floating elements for more visual interest */}
              <motion.div 
                className="absolute top-1/4 -right-10 h-8 w-8 rounded-full bg-secondary/10 z-0"
                animate={{ 
                  scale: [1, 1.2, 1],
                  x: [0, 5, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              ></motion.div>
              <motion.div 
                className="absolute bottom-1/3 -left-8 h-6 w-6 rounded-full bg-primary/10 z-0"
                animate={{ 
                  scale: [1, 1.3, 1],
                  x: [0, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              ></motion.div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Privacy Props Section */}
      <section id="privacy" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Your Data, Your Control</h2>
            <p className="text-muted-foreground">Privacy isn't a feature, it's our foundation.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Database className="h-8 w-8 text-primary" />,
                title: "100% Local Storage",
                description: "Everything is stored in your browser's IndexedDB. No servers, no APIs, no leaks."
              },
              {
                icon: <UserX className="h-8 w-8 text-primary" />,
                title: "Zero Signups",
                description: "No accounts to create. No passwords to remember. Use it immediately, privately."
              },
              {
                icon: <Lock className="h-8 w-8 text-primary" />,
                title: "Encrypted & Secure",
                description: "Built with modern web standards to ensure your schedule remains for your eyes only."
              }
            ].map((prop, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-card/40 border border-primary/10 backdrop-blur-md hover:border-primary/40 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="mb-6 p-4 rounded-2xl bg-primary/10 w-fit group-hover:scale-110 transition-transform">
                    {prop.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{prop.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{prop.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30 relative">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="absolute inset-0 overflow-hidden"
        >
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
            >
              Simple. Easy. <span className="text-primary">Powerful.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Caldy is designed to be out of your way. Minimalist interface, maximum productivity.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Layout className="h-6 w-6 text-primary" />,
                title: 'Clean Interface',
                description: 'A distraction-free workspace designed for deep focus and clarity.',
              },
              {
                icon: <Zap className="h-6 w-6 text-primary" />,
                title: 'Lightning Fast',
                description: 'Everything happens locally, making interactions near-instantaneous.',
              },
              {
                icon: <GridBackgroundIcon />,
                title: 'Bento Organization',
                description: 'Beautifully organized views that adapt to your screen and workflow.',
              },
              {
                icon: <Palette className="h-6 w-6 text-primary" />,
                title: 'Full Customization',
                description: 'Dark mode, custom categories, and color themes that suit your style.',
              },
              {
                icon: <Repeat className="h-6 w-6 text-primary" />,
                title: 'Smart Recurring',
                description: 'Powerfully simple recurring events that handle your routine for you.',
              },
              {
                icon: <CheckSquare className="h-6 w-6 text-primary" />,
                title: 'Unified Tasks',
                description: 'Tasks and events living together in harmony for better time management.',
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  y: -5
                }}
                viewport={{ once: true }}
                className={`bg-card border rounded-xl p-6 relative overflow-hidden group cursor-pointer`}
              >
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0`}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                ></motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="rounded-full bg-primary/10 w-14 h-14 flex items-center justify-center mb-4 relative z-10 shadow-sm"
                >
                  <motion.div 
                    animate={{ rotate: [0, 0, 0, 0, 0, 5, 0, -5, 0] }} 
                    transition={{ 
                      duration: 5, 
                      ease: "easeInOut", 
                      repeat: Infinity, 
                      repeatDelay: Math.random() * 3 + 2
                    }}
                  >
                    {feature.icon}
                  </motion.div>
                </motion.div>
                
                <motion.h3 
                  className="text-xl font-medium mb-2 relative z-10"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 + 0.2 }}
                  viewport={{ once: true }}
                >
                  {feature.title}
                </motion.h3>
                
                <motion.p 
                  className="text-muted-foreground relative z-10"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                >
                  {feature.description}
                </motion.p>
                
                <motion.div 
                  className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full opacity-0 group-hover:opacity-20 bg-primary z-0"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1.5, x: -5, y: -5 }}
                  transition={{ duration: 0.4 }}
                ></motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 relative overflow-hidden bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
                <Lock className="w-3 h-3" />
                <span>End-to-End Privacy</span>
              </div>
              <h2 className="text-4xl font-bold mb-6 tracking-tight">Your data never leaves your device. Period.</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Most calendar apps want your data for training AI or selling ads. Caldy is different. 
                We built it on top of local-first technologies so that your schedule is 
                stored only in your browser. No cloud, no database, no risk.
              </p>
              <ul className="space-y-4">
                {[
                  "No data is ever sent to our servers",
                  "Works completely offline",
                  "Instant export to JSON anytime",
                  "Open source code you can trust"
                ].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-muted-foreground"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="flex-1 relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center p-8">
                <div className="w-full h-full rounded-2xl bg-card border shadow-2xl overflow-hidden p-6 font-mono text-sm">
                  <div className="flex items-center gap-2 mb-4 border-b pb-2 opacity-50">
                    <div className="h-3 w-3 rounded-full bg-red-500/20" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
                    <div className="h-3 w-3 rounded-full bg-green-500/20" />
                    <span className="text-[10px]">local_storage.json</span>
                  </div>
                  <div className="text-primary/70">
                    <div>{`{`}</div>
                    <div className="pl-4">{`"events": [`}</div>
                    <div className="pl-8 text-foreground/80">{`{ "id": "1", "title": "Coffee with Me" },`}</div>
                    <div className="pl-8 text-foreground/80">{`{ "id": "2", "title": "Deep Work" }`}</div>
                    <div className="pl-4">{`],`}</div>
                    <div className="pl-4">{`"privacy": "100%",`}</div>
                    <div className="pl-4">{`"data_location": "Your Device"`}</div>
                    <div>{`}`}</div>
                  </div>
                  <motion.div 
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mt-4 inline-block px-2 py-1 bg-green-500/10 text-green-500 text-[10px] rounded"
                  >
                    STATUS: SECURE & LOCAL
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-accent/5 rounded-full blur-3xl transform translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.2, 0.3]
              }} 
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="w-[500px] h-[500px] rounded-full border border-primary/10"
            />
            <motion.div 
              animate={{ 
                scale: [1.1, 1, 1.1],
                opacity: [0.2, 0.3, 0.2]
              }} 
              transition={{ 
                duration: 10, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-accent/10"
            />
            <motion.div 
              animate={{ 
                scale: [0.9, 1.05, 0.9],
                opacity: [0.2, 0.1, 0.2]
              }} 
              transition={{ 
                duration: 7, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-primary/10"
            />
          </div>
        </motion.div>

        <div className="container mx-auto px-4 relative z-30">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-4"
            >
              Take Control of Your Time
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-muted-foreground mb-8"
            >
              Start using Caldy today. Your data never leaves your device. 100% Private. 100% Free.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.4,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              viewport={{ once: true }}
            >
              <Button asChild size="lg" className="shadow-lg relative overflow-hidden group">
                <Link href="/calendar" className="flex items-center">
                  <span className="relative z-10">Start Using Caldy</span>
                  <motion.div
                    initial={{ x: -5 }}
                    animate={{ x: 0 }}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="ml-2 h-4 w-4 relative z-10" />
                  </motion.div>
                  <motion.div 
                    className="absolute inset-0 bg-primary-foreground/10 z-0"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-primary/5 to-transparent opacity-40"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <div className="flex items-center mb-4 sm:mb-0">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <CalendarDays className="h-5 w-5 mr-2 text-primary" />
              </motion.div>
              <span className="font-bold">Caldy</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.a 
                href="https://github.com/AadiXC0DE/Caldy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
                <span className="sr-only">GitHub</span>
              </motion.a>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center pt-2 border-t border-primary/10">
            <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
              © {new Date().getFullYear()} Caldy. <span className="text-xs bg-primary/10 rounded-full px-2 py-0.5 ml-1">Open Source</span>
            </div>
            
            <div className="text-sm text-muted-foreground flex items-center">
              Made with{' '}
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mx-1"
              >
                ❤️
              </motion.span>
              {' '}by <motion.a 
                href="https://github.com/AadiXC0DE" 
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-primary transition-colors ml-1 border-b border-dashed border-primary/30"
                whileHover={{ y: -1 }}
              >
                Aaditya
              </motion.a>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <motion.div 
          className="absolute bottom-0 left-1/4 w-24 h-24 rounded-full bg-primary/5 -z-10"
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.2, 0.3, 0.2] 
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-0 right-1/3 w-16 h-16 rounded-full bg-primary/5 -z-10"
          animate={{ 
            y: [0, 10, 0],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </footer>
    </div>
  );
}
