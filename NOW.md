# NOW - Current Development Focus

> **Update this file at the end of each session** to track where we left off.

## Last Updated

2026-01-27 - Photo upload complete, utility scripts added

## Current Phase

**Events Management Complete** - Ready for deployment

---

## What Was Completed This Session

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

### 1. Deploy to Vercel

- [ ] Deploy `apps/telegram-app`
- [ ] Deploy `apps/admin`
- [ ] Set all environment variables in Vercel
- [ ] Update Calendly webhook URL to production

### 2. Configure Production Webhooks

- [ ] Update Calendly webhook to production URL
- [ ] Set up Telegram bot webhook

---

## Blocked On

Nothing - ready for deployment

---

## Recently Completed

- [x] Events table with Calendly data
- [x] Admin events page with inline editing
- [x] Supabase Storage for event photos
- [x] Photo upload API with Sharp resize
- [x] Uploaded banya-themed photos for all 4 events
- [x] Telegram Mini App with native theme
- [x] Utility script for bulk photo uploads
- [x] CLAUDE.md updated with scripts docs

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
