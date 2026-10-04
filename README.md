# Caldy

A calendar, tasks, notes, habits and focus sessions in one place, living on your own device. No account needed, nothing synced anywhere unless you ask for it.

[caldy.vercel.app](https://caldy.vercel.app)

## What it does

Calendar with iCal import and holiday overlays, tasks with recurring items and progress, notes, habits, and a focus timer. Everything lands in IndexedDB, and export/import is plain JSON, so you can walk out with your data whenever you want.

Sync is opt-in and off by default. Pro today is the billing plumbing; encrypted backup and multi-device sync come later.

## Run it

```bash
git clone https://github.com/AadiXC0DE/Caldy.git
cd Caldy
npm install --legacy-peer-deps   # React 19 and shadcn disagree on peers
cp .env.example .env.local
npm run dev
```

Local mode needs no keys. Clerk and Lemon Squeezy are only read if you want sign-in and billing live, so leave every value blank in `.env.local` and the app still runs.

`.env.example` has the full list.

## Stack

Next.js, TypeScript, Tailwind, shadcn/ui, Framer Motion, ical.js.

Deploy it anywhere that runs Next.js API routes: Vercel, Railway, Render, Fly, or your own box. GitHub Pages is out, since the auth and billing routes need a server. The code can stay open source either way.

## License

MIT. See [LICENSE](./LICENSE).
