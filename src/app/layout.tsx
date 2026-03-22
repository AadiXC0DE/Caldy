import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { Analytics } from '@vercel/analytics/next';
import { ClerkProvider } from '@clerk/nextjs';
import { AppProvider } from '@/contexts/AppContext';
import { Toaster } from '@/components/ui/sonner';
import { Confetti } from '@/components/common/Confetti';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Caldy - Local-First Daily Operating System',
  description:
    'Plan your day, manage tasks, capture notes, and stay focused with a local-first productivity workspace.',
  icons: {
    icon: '/favicon.ico',
  },
};

// Check if Clerk is configured with real keys (not placeholders)
const isClerkConfigured =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_');

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppProvider>
            {children}
            <Toaster />
            <Confetti />
            <Analytics />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );

  // Only wrap in ClerkProvider when real keys are configured.
  // Self-hosters skip Clerk entirely — the app runs without auth.
  if (isClerkConfigured) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
