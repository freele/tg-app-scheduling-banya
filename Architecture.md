# Bania Booking System

A simplified reservation system for Bania/Spa bookings using **Calendly** for scheduling, with a Telegram Mini App interface and admin panel for payment tracking.

## Features

- **Telegram Mini App** with embedded Calendly for customer bookings
- **Admin panel** for viewing bookings and managing payments
- **Calendly integration** handles scheduling, availability, and calendar sync
- **Supabase** for database and admin authentication
- **Payment tracking** (mark bookings as paid/pending/refunded)

## Architecture

```
┌─────────────────────────────────────────┐
│       Telegram Mini App                 │
│       (Calendly Embed)                  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│           Calendly                      │
│   (Scheduling + Google Calendar Sync)   │
└─────────────────────────────────────────┘
                    │ webhook
                    ▼
┌─────────────────────────────────────────┐
│      /api/calendly/webhook              │
│      (Syncs bookings to Supabase)       │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│           Admin Panel                   │
│   (View bookings, manage payments)      │
└─────────────────────────────────────────┘
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Next.js 15 (App Router) |
| Booking | Calendly (embedded widget) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (admin only) |
| Calendar | Google Calendar (via Calendly) |
| Styling | Tailwind CSS |
| Deployment | Vercel |

## Project Structure

```
bania/
├── apps/
│   ├── telegram-app/     # Telegram Mini App + API routes
│   │   ├── src/app/
│   │   │   ├── page.tsx              # Calendly embed
│   │   │   └── api/
│   │   │       ├── calendly/webhook  # Calendly webhook handler
│   │   │       └── telegram/webhook  # Telegram bot webhook
│   │   └── src/components/
│   │       └── CalendlyEmbed.tsx
│   └── admin/            # Admin panel
│       └── src/app/
│           ├── dashboard/            # Dashboard with stats
│           └── dashboard/bookings/   # Bookings list + detail
├── packages/
│   ├── shared/           # Types, schemas, utilities
│   └── supabase/         # Database client & migrations
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Supabase account
- Telegram Bot (create via @BotFather)
- Calendly account (Pro+ for webhooks)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd bania
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure environment variables in `.env.local`

5. Set up Supabase:
   - Create a new Supabase project
   - Run the migration: `packages/supabase/migrations/001_initial_schema.sql`
   - Copy your project URL and keys to `.env.local`

6. Build packages:
   ```bash
   pnpm build
   ```

7. Start development servers:
   ```bash
   pnpm dev
   ```
   - Telegram App: http://localhost:3000
   - Admin Panel: http://localhost:3001

### Calendly Setup

1. **Create Calendly Account**
   - Sign up at calendly.com
   - Choose Pro+ plan (required for webhooks)

2. **Create Event Types**
   - Create event types for your services (e.g., "Bania Session - 2 hours")
   - Set availability, buffer times, etc.

3. **Add Custom Questions**
   - Add "Phone number" (required)
   - Add "Number of guests" (dropdown: 1-8)

4. **Connect Google Calendar**
   - Settings → Integrations → Google Calendar
   - All bookings will sync automatically

5. **Set Up Webhook**
   - Settings → Integrations → Webhooks
   - URL: `https://your-app.vercel.app/api/calendly/webhook`
   - Events: `invitee.created`, `invitee.canceled`
   - Copy the signing key to `CALENDLY_WEBHOOK_SIGNING_KEY`

6. **Get Your Calendly URL**
   - Copy your event type URL
   - Set it as `NEXT_PUBLIC_CALENDLY_URL`

### Telegram Bot Setup

1. Create a bot with @BotFather
2. Set the bot token in `TELEGRAM_BOT_TOKEN`
3. Set the webhook URL:
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-app.vercel.app/api/telegram/webhook"
   ```
4. Configure the Mini App in BotFather:
   - Use `/mybots` → Your Bot → Bot Settings → Menu Button
   - Set URL to your deployed app

## Development

```bash
# Start all apps in development
pnpm dev

# Build all packages and apps
pnpm build

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Create two projects:
   - `bania-telegram-app` (root: `apps/telegram-app`)
   - `bania-admin` (root: `apps/admin`)
3. Set environment variables in Vercel dashboard
4. Deploy
5. Update Calendly webhook URL to production URL
6. Update Telegram webhook to production URL

### Environment Variables

See `.env.example` for required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Telegram
TELEGRAM_BOT_TOKEN=
NEXT_PUBLIC_TELEGRAM_WEBAPP_URL=

# Calendly
NEXT_PUBLIC_CALENDLY_URL=
CALENDLY_WEBHOOK_SIGNING_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

## Database Schema

Single table design - `bookings` synced from Calendly:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| calendly_event_uri | text | Calendly event reference |
| event_type_name | text | e.g., "Bania Session 2h" |
| start_time | timestamptz | Session start |
| end_time | timestamptz | Session end |
| invitee_name | text | Guest name |
| invitee_email | text | Guest email |
| invitee_phone | text | Guest phone |
| guests_count | int | Number of guests |
| status | enum | scheduled/cancelled/completed |
| payment_status | enum | pending/paid/refunded |
| payment_amount | decimal | Payment amount |

See `packages/supabase/migrations/001_initial_schema.sql` for full schema.

## API Endpoints

- `POST /api/calendly/webhook` - Receives Calendly booking events
- `POST /api/telegram/webhook` - Telegram bot commands
- `GET /api/telegram/webhook` - Health check

## License

Private - All rights reserved
