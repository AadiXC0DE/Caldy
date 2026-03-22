# Caldy: Local-First Daily Operating System

Caldy is a local-first productivity workspace built with **Next.js**. It brings together your calendar, tasks, notes, habits, planner, and focus sessions in one place while keeping your day-to-day data on your device by default.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Acertinity UI
- **Animation**: Framer Motion
- **State Management**: React Context API
- **iCal Integration**: ical.js
- **Icons**: Lucide React

## Product Model

- `Free local mode`: use the full app on a single device with local browser storage, export/import, offline-friendly behavior, and no forced sync.
- `Pro`: optional billing for account-linked features such as checkout/portal flows today and future privacy-cloud capabilities like encrypted backup, multi-device sync, and version history.

## Getting Started

To get started with the project, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/AadiXC0DE/Caldy.git
   cd Caldy
   ```

2. **Install dependencies**:

   ```bash
   npm install --legacy-peer-deps
   ```

   _Note: The `--legacy-peer-deps` flag is used due to a mismatch between React 19 and Shadcn UI dependencies._

3. **Create your environment file**:

   ```bash
   cp .env.example .env.local
   ```

   Free local mode works without Clerk or Lemon Squeezy keys. Add real values only if you want auth and billing flows enabled.

4. **Run the development server**:

   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000) to see the application in action.

## Features

- Local-first calendar, tasks, notes, habits, planner, and focus workflows
- IndexedDB-backed persistence with JSON export/import
- iCal import and holiday overlays
- Custom views, recurring items, progress tracking, and focus sessions
- Theme support and a polished motion-driven UI
- Optional Clerk + Lemon Squeezy integration for account and Pro billing flows

## Environment

These variables are optional unless you want to enable the related features:

- `NEXT_PUBLIC_APP_URL`: public app URL used by billing redirects
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: enables Clerk on the client
- `CLERK_SECRET_KEY`: enables Clerk server routes and metadata updates
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- `LEMONSQUEEZY_API_KEY`: enables Lemon Squeezy checkout and portal lookups
- `LEMONSQUEEZY_STORE_ID`: used when creating hosted checkout sessions
- `LEMONSQUEEZY_WEBHOOK_SECRET`: verifies Lemon Squeezy webhooks
- `LEMONSQUEEZY_VARIANT_PRO_MONTHLY`
- `LEMONSQUEEZY_VARIANT_PRO_LIFETIME`
- `LEMONSQUEEZY_TEST_MODE`: set to `true` for test checkouts in development

## Deployment Modes

- Public GitHub repo: no special env required beyond local mode. The code can stay open source.
- GitHub Pages: not supported for the live product because Caldy uses Next.js API routes, middleware, and server-side auth/billing handlers.
- Hosted SaaS deployment: use Vercel, Railway, Render, Fly.io, or your own VPS so `/api/billing/*` and `/api/webhooks/lemonsqueezy` can run.

### Local-only / open-source env

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
LEMONSQUEEZY_VARIANT_PRO_MONTHLY=
LEMONSQUEEZY_VARIANT_PRO_LIFETIME=
LEMONSQUEEZY_TEST_MODE=true
```

### Hosted SaaS env

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

LEMONSQUEEZY_API_KEY=lsq_xxxxx
LEMONSQUEEZY_STORE_ID=12345
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_xxxxx
LEMONSQUEEZY_VARIANT_PRO_MONTHLY=111111
LEMONSQUEEZY_VARIANT_PRO_LIFETIME=222222
LEMONSQUEEZY_TEST_MODE=false
```

Rotate any real secret keys that were pasted into chat or committed anywhere by accident.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is open-source and available under the [MIT License](LICENSE).
