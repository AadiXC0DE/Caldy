'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CalendarDays, CheckSquare, Clock, Palette, Moon, ArrowRight, BellRing, Repeat, ArrowDownUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-background text-foreground">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/5 to-background/0"></div>
        <div className="container mx-auto px-4 pt-20 pb-24 sm:pt-24 sm:pb-32">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center">
              <CalendarDays className="h-7 w-7 mr-2 text-primary" />
              <span className="text-2xl font-bold">Caldy</span>
            </div>
            <div className="hidden sm:flex space-x-6">
              <Link href="/features" className="hover:text-primary transition-colors">Features</Link>
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            </div>
            <Button asChild variant="default" className="shadow-sm">
              <Link href="/calendar">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl"
            >
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                Beautiful Calendar & Task Management in One Place
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Caldy combines a stunning calendar interface with powerful task management to help you organize your life beautifully.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="shadow-lg">
                  <Link href="/calendar">Try Caldy Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/features">Explore Features</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="w-full aspect-square md:aspect-[4/3] rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-1 shadow-xl">
                <div className="h-full w-full rounded-lg bg-card overflow-hidden border shadow-sm">
                  <div className="bg-primary/10 p-4 flex items-center justify-between border-b">
                    <div className="flex items-center">
                      <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                      <span className="font-medium">Calendar View</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 text-center text-xs font-medium py-2 border-b">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                      <div key={day} className="py-1">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 text-center text-sm">
                    {[...Array(35)].map((_, i) => {
                      const isCurrentMonth = i >= 4 && i < 34;
                      const isToday = i === 15;
                      const hasEvent = [10, 15, 22, 27].includes(i);
                      
                      return (
                        <div 
                          key={i} 
                          className={`py-2 relative ${isCurrentMonth ? '' : 'text-muted-foreground text-opacity-40'} ${isToday ? 'bg-primary/10' : ''}`}
                        >
                          <span className={`flex items-center justify-center h-8 w-8 mx-auto ${isToday ? 'bg-primary text-primary-foreground rounded-full' : ''}`}>
                            {i - 4 <= 0 ? i + 27 : i - 4 > 30 ? i - 34 : i - 4}
                          </span>
                          {hasEvent && (
                            <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1 w-1 rounded-full ${i === 15 ? 'bg-blue-400' : i === 10 ? 'bg-green-400' : i === 22 ? 'bg-purple-400' : 'bg-amber-400'}`}></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Caldy combines the best of calendar and task management apps with beautiful UI and smooth animations.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <CalendarDays className="h-6 w-6 text-primary" />,
                title: 'Beautiful Calendar',
                description: 'Full-screen responsive calendar with monthly, weekly, and daily views.'
              },
              {
                icon: <CheckSquare className="h-6 w-6 text-primary" />,
                title: 'Task Management',
                description: 'Integrated task management system to keep track of your to-dos and goals.'
              },
              {
                icon: <ArrowDownUp className="h-6 w-6 text-primary" />,
                title: 'Drag & Drop',
                description: 'Easily reschedule events and tasks with intuitive drag-and-drop functionality.'
              },
              {
                icon: <Palette className="h-6 w-6 text-primary" />,
                title: 'Color Coding',
                description: 'Organize your events and tasks with custom color coding for different categories.'
              },
              {
                icon: <Repeat className="h-6 w-6 text-primary" />,
                title: 'Recurring Events',
                description: 'Create recurring events and tasks with flexible scheduling options.'
              },
              {
                icon: <BellRing className="h-6 w-6 text-primary" />,
                title: 'Reminders',
                description: 'Set customizable reminders and notifications for important events and deadlines.'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Organized?</h2>
            <p className="text-muted-foreground mb-8">
              Start managing your schedule and tasks with Caldy today. No account required - your data is stored locally.
            </p>
            <Button asChild size="lg" className="shadow-lg">
              <Link href="/calendar">
                Start Using Caldy
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <CalendarDays className="h-5 w-5 mr-2 text-primary" />
              <span className="font-bold">Caldy</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Caldy. Made with ❤️
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
