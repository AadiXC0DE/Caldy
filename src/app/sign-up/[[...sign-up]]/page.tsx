import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { CalendarDays, CheckCircle2, Cloud, HardDriveDownload, Sparkles } from 'lucide-react';

const proReasons = [
  'Encrypted cloud backup and cross-device continuity',
  'Restore your workspace on a new browser or laptop',
  'Version history, premium templates, and richer workflow insights once Pro launches',
];

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden border-b p-8 lg:border-b-0 lg:border-r lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(var(--primary-rgb),0.16),transparent_42%)]" />
          <div className="relative mx-auto flex h-full max-w-xl flex-col justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xl font-bold">Caldy</div>
                  <div className="text-xs text-muted-foreground">
                    Local-first productivity with Pro coming soon
                  </div>
                </div>
              </Link>

              <div className="mt-16 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3 w-3" />
                <span>Pro is coming soon</span>
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
                Create your account now and you will be ready when Pro opens up.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Free local mode remains usable without an account. Sign up when you are ready to
                have an account in place before backup, sync, and restore go live.
              </p>

              <div className="mt-10 grid gap-4">
                <div className="rounded-[2rem] border bg-card/75 p-6 shadow-sm backdrop-blur">
                  <div className="mb-4 flex items-center gap-2 text-sm font-medium">
                    <Cloud className="h-4 w-4 text-primary" />
                    What Pro will add
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {proReasons.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[2rem] border bg-card/75 p-6 shadow-sm backdrop-blur">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <HardDriveDownload className="h-4 w-4 text-primary" />
                    Still want Free only?
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    You can keep using Caldy locally on one device without signing up. Pro is for
                    continuity and premium workflow depth, not for unlocking the basic app.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-sm text-muted-foreground">
              Want to try the free local experience first?{' '}
              <Link
                href="/dashboard"
                className="font-medium text-primary transition-colors hover:opacity-80"
              >
                Open Caldy
              </Link>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md rounded-[2rem] border bg-card/85 p-4 shadow-2xl backdrop-blur sm:p-6">
            <SignUp
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none border-0 bg-transparent',
                  headerTitle: 'text-foreground text-2xl font-semibold',
                  headerSubtitle: 'text-muted-foreground',
                  socialButtonsBlockButton: 'rounded-xl border-border shadow-none',
                  formButtonPrimary:
                    'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
                  footerActionLink: 'text-primary hover:text-primary/80',
                  formFieldInput: 'rounded-xl border-border',
                },
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
