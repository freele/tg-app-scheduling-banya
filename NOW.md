# NOW - Current Development Focus

> **Update this file at the end of each session** to track where we left off.

## Last Updated
2026-01-27 - Events management implemented, dynamic events working

## Current Phase
**Events Management Complete** - Ready for photo uploads and deployment

---

## What Was Completed This Session

### 1. Events Table Created in Supabase
- Created `events` table with: id, name, slug, description, photo_url, price, duration, calendly_url, metadata, display_order, is_active
- Migration: `supabase/migrations/20260127000003_events_table.sql`
- Seeded with 4 events from Calendly

### 2. Admin Events Management Page
- Built at `/dashboard/events`
- Scrollable table with all events
- Inline editing (name, price, duration, max guests, description)
- Toggle active/inactive status
- Links to Calendly: "Book" (test booking) and "Manage" (edit in Calendly)
- Delete events

### 3. Telegram App Uses Dynamic Events
- Refactored to server components fetching from Supabase
- Events displayed with photos, prices, duration, max guests
- Book page fetches event by slug from database

---

## Next Steps (In Order)

### 1. Photo Upload for Events
- Add Supabase Storage bucket for event photos
- Add photo upload UI in admin events page
- Update photo_url in events table

### 2. Sync Events from Calendly (Optional)
- Add "Sync from Calendly" button to fetch new events
- Useful when new event types are created in Calendly

### 3. Deploy to Vercel
- [ ] Deploy `apps/telegram-app`
- [ ] Deploy `apps/admin`
- [ ] Set all environment variables in Vercel
- [ ] Update Calendly webhook URL to production

---

## Blocked On
Nothing - ready for photo uploads or deployment

---

## Recently Completed
- [x] Events table created with Calendly data
- [x] Admin events page with inline editing
- [x] Calendly links (Book/Manage) in events table
- [x] Telegram app fetches events from Supabase
- [x] Both apps build successfully

---

## Notes for Next Session

The 4 events from Calendly are now in the database:
1. Аренда бани без пармастера (4ч, €340)
2. Программа Бережная баня с пармастером (4ч, €500)
3. Разовое посещение по субботам - женщины (4ч, €60)
4. Разовое посещение по субботам - мужчины (4ч, €60)

To add photos, either:
- Set up Supabase Storage and add upload UI
- Or manually add photo URLs to the database via admin panel edit
