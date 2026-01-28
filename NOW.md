# NOW - Current Development Focus

> **Update this file at the end of each session** to track where we left off.

## Last Updated

2026-01-28 - Telegram user tracking for messaging capability

## Current Phase

**Telegram Messaging Feature** - Ready for deployment (migration needed)

---

## What Was Completed This Session

### 1. Telegram User ID Tracking

Added ability to capture Telegram user ID when booking through Mini App, enabling messaging:

- Migration: `packages/supabase/migrations/002_add_telegram_user_id.sql`
- CalendlyEmbed passes `telegram_user_id` via UTM parameters
- Webhook extracts and stores `telegram_user_id` in bookings table
- Admin panel shows Telegram indicator and user ID

### 2. Calendly Widget Improvements (Previous Session)

- Switched to official Calendly widget.js
- Added `hide_gdpr_banner=1` to reduce cookie prompts
- Added webhook management script

---

## Previous Session Work

### 1. Photo Upload Feature

- Created Supabase Storage bucket `event-photos`
- Migration: `supabase/migrations/20260127000004_storage_bucket.sql`
- Added photo upload API route with Sharp image processing (800x600, 85% quality)
- Admin panel: click photo thumbnail to upload, hover to remove

### 2. Uploaded Event Photos

Found and uploaded banya-themed photos from Unsplash:

| Event                       | Photo Theme                          |
| --------------------------- | ------------------------------------ |
| Аренда бани без пармастера  | Wooden sauna interior with benches   |
| Программа Бережная баня     | Sauna with bucket and venik accessories |
| Разовое посещение (женщины) | Spa wellness atmosphere              |
| Разовое посещение (мужчины) | Classic wooden sauna interior        |

### 3. Telegram Mini App Redesign

- Updated to use Telegram native theme CSS variables (`bg-tg-*`, `text-tg-*`)
- Event cards with photos, price badges, duration, descriptions
- Mobile-friendly design for Telegram WebView
- Russian language UI

### 4. Utility Scripts

- Created `scripts/upload-event-photos.mjs` for bulk photo uploads
- Updated CLAUDE.md with scripts documentation
- Added Makefile with `make free-ports` command

---

## Next Steps (In Order)

### 1. Run Database Migration

Run in Supabase SQL Editor:

```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT;
CREATE INDEX IF NOT EXISTS idx_bookings_telegram_user_id ON bookings(telegram_user_id);
```

### 2. Deploy to Vercel

- [ ] Deploy `apps/telegram-app`
- [ ] Deploy `apps/admin`
- [ ] Set all environment variables in Vercel

### 3. Webhooks Already Configured

- Calendly webhook: pointing to production
- Use `make webhook URL=<url>` to update if needed

---

## Blocked On

Nothing - ready for deployment

---

## Recently Completed

- [x] **Telegram user ID tracking** for messaging capability
- [x] Official Calendly widget integration
- [x] Webhook management script (`make webhook URL=...`)
- [x] Events table with Calendly data
- [x] Admin events page with inline editing
- [x] Supabase Storage for event photos
- [x] Photo upload API with Sharp resize
- [x] Uploaded banya-themed photos for all 4 events
- [x] Telegram Mini App with native theme

---

## Notes for Next Session

All 4 events have photos uploaded. Both apps build successfully.

To test locally:

```bash
pnpm dev
```

- Telegram Mini App: http://localhost:3000
- Admin Panel: http://localhost:3001/dashboard/events

To re-upload photos:

```bash
cd apps/admin && node ../../scripts/upload-event-photos.mjs
```
