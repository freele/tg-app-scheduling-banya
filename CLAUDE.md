# Bania Booking System - Agent Context

## Session Management Files

> **Update these files at the end of each session:**

| File | Purpose | Update When |
|------|---------|-------------|
| `NOW.md` | Current dev focus, next steps, blockers | End of session - update progress & next steps |
| `HEY.md` | Action items for the user (credentials, decisions, tests) | When needing user input or completing items |
| `CLAUDE.md` | Technical context for agents (this file) | When architecture or key decisions change |
| `DEPLOYMENT.md` | Vercel deployment instructions | When deployment process changes |

**Start each session by reading:** `NOW.md` → `HEY.md` → `CLAUDE.md`

---

## Project Overview

A reservation system for Bania/Spa bookings using **Calendly** as the booking engine, with a **Telegram Mini App** for customers and an **Admin Panel** for managing payments.

## MCP Servers

- **Supabase MCP** (`@supabase/mcp-server-supabase`) - Direct database access
  - Project ID: `cqjkmzejtzqfpxwlulrt`
  - URL: `https://cqjkmzejtzqfpxwlulrt.supabase.co`
  - Config: `.mcp.json` (gitignored, contains secrets)

## Architecture

```
Telegram Mini App (Calendly embed)
         ↓
    Calendly (handles scheduling, availability, Google Calendar sync)
         ↓ webhook
    /api/calendly/webhook → Supabase (bookings table)
         ↓
    Admin Panel (view bookings, manage payments)
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
│   ├── telegram-app/          # Telegram Mini App
│   │   ├── src/app/
│   │   │   ├── page.tsx       # Main page with CalendlyEmbed
│   │   │   └── api/
│   │   │       ├── calendly/webhook/  # Calendly webhook handler
│   │   │       └── telegram/webhook/  # Telegram bot webhook
│   │   └── src/components/
│   │       ├── CalendlyEmbed.tsx
│   │       └── TelegramProvider.tsx
│   └── admin/                  # Admin Panel
│       └── src/app/
│           ├── dashboard/page.tsx           # Stats dashboard
│           └── dashboard/bookings/
│               ├── page.tsx                 # Bookings list with filters
│               └── [id]/
│                   ├── page.tsx             # Booking detail
│                   └── PaymentForm.tsx      # Payment management
├── packages/
│   ├── shared/                 # Shared code
│   │   └── src/
│   │       ├── types.ts        # TypeScript types (Booking, Calendly payloads)
│   │       ├── schemas.ts      # Zod validation schemas
│   │       ├── utils.ts        # Date/time utilities
│   │       └── constants.ts    # Enums and constants
│   └── supabase/               # Database package
│       ├── src/
│       │   ├── client.ts       # Browser client
│       │   ├── server.ts       # Server client
│       │   └── database.types.ts
│       └── migrations/
│           └── 001_initial_schema.sql
├── scripts/                    # Utility scripts
│   └── upload-event-photos.mjs # Bulk upload photos to events
├── supabase/                   # Database migrations
│   └── migrations/
├── .mcp.json                   # MCP server config (gitignored)
├── .env.example
├── pnpm-workspace.yaml
├── turbo.json
├── Makefile                    # Dev shortcuts (make free-ports)
└── package.json
```

## Database Schema

### `events` table (event types from Calendly)

```sql
id, name, slug, description_plain, description_html
photo_url              -- Stored in Supabase Storage (event-photos bucket)
price, currency        -- e.g., 340.00, 'EUR'
duration               -- Minutes
calendly_url           -- Booking link
calendly_event_uri     -- Calendly API reference
max_guests, display_order, is_active, color, metadata
```

### `bookings` table (synced from Calendly webhooks)

```sql
calendly_event_uri      -- Unique Calendly reference
calendly_invitee_uri    -- Unique invitee reference
event_type_name         -- "Bania Session 2h"
start_time, end_time    -- Session times
invitee_name, invitee_email, invitee_phone
guests_count            -- Number of guests
status                  -- 'scheduled' | 'cancelled' | 'completed'
payment_status          -- 'pending' | 'paid' | 'refunded'
payment_amount          -- Decimal amount
calendly_payload        -- Full webhook payload (JSONB)
```

### Supabase Storage

- **Bucket**: `event-photos` (public, max 5MB, jpeg/png/webp/gif)

## Key Design Decisions

1. **Calendly for booking UI** - No custom booking interface needed
2. **Single bookings table** - Simplified from resources/events/bookings
3. **Payment tracking in admin** - Manual status updates (no payment gateway)
4. **Webhook-based sync** - Calendly pushes to our API, we store in Supabase
5. **Vercel deployment** - Both apps as serverless

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://cqjkmzejtzqfpxwlulrt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

TELEGRAM_BOT_TOKEN=
NEXT_PUBLIC_TELEGRAM_WEBAPP_URL=

NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-org/bania-session
CALENDLY_WEBHOOK_SIGNING_KEY=

NEXT_PUBLIC_APP_URL=
```

## Important Files

- **Migration**: `packages/supabase/migrations/001_initial_schema.sql`
- **Types**: `packages/shared/src/types.ts`
- **Calendly Webhook**: `apps/telegram-app/src/app/api/calendly/webhook/route.ts`
- **Payment Form**: `apps/admin/src/app/dashboard/bookings/[id]/PaymentForm.tsx`
- **Plan**: `/Users/kremenets/.claude/plans/fluffy-crunching-treasure.md`

## Common Tasks

### Run migrations
Use Supabase MCP or run SQL directly in Supabase dashboard.

### Add new Calendly question extraction
Edit `apps/telegram-app/src/app/api/calendly/webhook/route.ts`:
- `extractPhone()` - extracts phone from questions
- `extractGuestsCount()` - extracts guest count

### Update payment tracking

Edit `apps/admin/src/app/dashboard/bookings/[id]/PaymentForm.tsx`

## Utility Scripts

Scripts in `scripts/` directory for common operations:

### upload-event-photos.mjs

Bulk upload photos to events from Unsplash URLs.

```bash
cd apps/admin && node ../../scripts/upload-event-photos.mjs
```

- Downloads images from Unsplash (free to use)
- Removes old photos from Supabase Storage
- Uploads new photos and updates database
- Edit `PHOTOS` array in the script to change images

### set-calendly-webhook.sh

Set Calendly webhook URL for production or development.

```bash
./scripts/set-calendly-webhook.sh https://your-app.vercel.app/api/calendly/webhook
```

- Deletes existing webhooks
- Creates new webhook with specified URL
- Events: `invitee.created`, `invitee.canceled`

## Makefile Commands

```bash
make free-ports                        # Kill processes on ports 3000 and 3001
make webhook URL=<webhook_url>         # Set Calendly webhook URL
```

## Status

- [x] Monorepo setup (pnpm + Turborepo)
- [x] Shared package (types, schemas)
- [x] Supabase package (client, migrations)
- [x] Telegram Mini App with Calendly embed
- [x] Calendly webhook handler
- [x] Admin panel with payment tracking
- [x] MCP server configured
- [x] Events table with Calendly sync
- [x] Events management in admin (CRUD, photo upload)
- [x] Supabase Storage for event photos
- [x] Telegram Mini App fetches events from DB
- [ ] Deploy to Vercel
- [ ] Configure Calendly webhooks in production
- [ ] Set up Telegram bot webhooks
