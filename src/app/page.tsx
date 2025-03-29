'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { CalendarDays, CheckSquare, Clock, Palette, Moon, Sun, ArrowRight, BellRing, Repeat, ArrowDownUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import { TypewriterEffect } from '@/components/TypewriterEffect';
import { TypewriterEffectSmooth } from '@/components/TypewriterEffect';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeDay, setActiveDay] = useState(15); // Default to "today" in the demo
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cursorRef = useRef(null);
  
  // Cursor animation values
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Create spring animations for smoother cursor movement
  const springConfig = { damping: 25, stiffness: 150 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true);
    
    // Update cursor position on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16); 
      cursorY.set(e.clientY - 16);
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Custom cursor follow element */}
      <motion.div
        ref={cursorRef}
        className="hidden md:block fixed w-8 h-8 rounded-full border-2 border-primary pointer-events-none z-50 mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Mouse follower gradient */}
      <div 
        className="hidden md:block fixed w-[300px] h-[300px] rounded-full bg-gradient-to-r from-primary/10 to-primary/5 blur-3xl pointer-events-none z-10 opacity-40"
        style={{
          left: mousePosition.x - 150,
          top: mousePosition.y - 150,
          transition: 'left 0.8s cubic-bezier(0.2, 1, 0.3, 1), top 0.8s cubic-bezier(0.2, 1, 0.3, 1)'
        }}
      />
      
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-background text-foreground">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/5 to-background/0"></div>
        <div className="container mx-auto px-4 pt-20 pb-24 sm:pt-24 sm:pb-32">
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
              <TypewriterEffect
                className="mb-6 tracking-tight"
                words={[
                  { text: "Beautiful" },
                  { text: "Calendar", className: "text-primary" },
                  { text: "&" },
                  { text: "Task" },
                  { text: "Management" },
                  { text: "in" },
                  { text: "One" },
                  { text: "Place" },
                ]}
              />
              <p className="text-lg text-muted-foreground mb-8">
                Caldy combines a stunning calendar interface with powerful task management to help you organize your life beautifully.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="shadow-lg relative overflow-hidden group">
                  <Link href="/calendar">
                    <span className="relative z-10">Try Caldy Now</span>
                    <motion.div 
                      className="absolute inset-0 bg-primary-foreground/10 z-0" 
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="group relative overflow-hidden">
                  <Link href="/calendar">
                    <span className="relative z-10 group-hover:text-primary transition-colors">Explore Features</span>
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
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
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
                    {[...Array(35)].map((_, i) => {
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

      {/* Features Section */}
      <section className="py-20 bg-muted/30 relative">
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
              className="text-3xl font-bold mb-4"
            >
              Powerful Features
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              Caldy combines the best of calendar and task management apps with beautiful UI and smooth animations.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <CalendarDays className="h-6 w-6 text-primary" />,
                title: 'Beautiful Calendar',
                description: 'Full-screen responsive calendar with monthly, weekly, and daily views.',
              },
              {
                icon: <CheckSquare className="h-6 w-6 text-primary" />,
                title: 'Task Management',
                description: 'Integrated task management system to keep track of your to-dos and goals.',
              },
              {
                icon: <ArrowDownUp className="h-6 w-6 text-primary" />,
                title: 'Drag & Drop',
                description: 'Easily reschedule events and tasks with intuitive drag-and-drop functionality.',
              },
              {
                icon: <Palette className="h-6 w-6 text-primary" />,
                title: 'Color Coding',
                description: 'Organize your events and tasks with custom color coding for different categories.',
              },
              {
                icon: <Repeat className="h-6 w-6 text-primary" />,
                title: 'Recurring Events',
                description: 'Create recurring events and tasks with flexible scheduling options.',
              },
              {
                icon: <BellRing className="h-6 w-6 text-primary" />,
                title: 'Reminders',
                description: 'Set customizable reminders and notifications for important events and deadlines.',
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
              className="text-3xl font-bold mb-4"
            >
              Ready to Get Organized?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-muted-foreground mb-8"
            >
              Start managing your schedule and tasks with Caldy today. No account required - your data is stored locally.
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
