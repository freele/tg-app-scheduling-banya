# NOW - Current Development Focus

> **Update this file at the end of each session** to track where we left off.

## Last Updated
2026-01-27 - Calendly webhook working, admin panel payment buttons fixed

## Current Phase
**Events Management** - Create admin interface for managing event types

---

## Next Steps (In Order)

### 1. Create Events Table in Supabase
Create a new `events` table to store event types with:
- id, name, slug, description
- photo_url (for uploaded images)
- price, duration
- calendly_url (booking link)
- metadata (JSONB for extra info)
- display_order, is_active

### 2. Build Events Admin Interface
Create a scrollable admin view where each row is an event:
- Editable fields: name, description, price, duration, calendly_url
- Photo upload cell
- Metadata editor
- Save/delete actions
- Drag to reorder (optional)

### 3. Update Telegram App to Use Dynamic Events
Replace hardcoded events in `apps/telegram-app/src/app/page.tsx` with data from Supabase events table.

### 4. Deploy to Vercel
- [ ] Deploy `apps/telegram-app`
- [ ] Deploy `apps/admin`
- [ ] Set all environment variables in Vercel
- [ ] Update Calendly webhook URL to production

---

## Blocked On
Nothing - ready to build events management

---

## Recently Completed
- [x] Calendly webhook configured and working
- [x] Webhook subscription created via API
- [x] SUPABASE_SERVICE_ROLE_KEY added to env files
- [x] Mark Paid button added to bookings table
- [x] Payment form fixed with server actions (RLS bypass)
- [x] Renamed "View" to "Details" in bookings table
- [x] Booking flow tested end-to-end

---

## Notes for Next Session

User will provide 4 events to create with:
- Descriptions
- Photos
- Metadata
- Booking URLs

Admin interface should be a single scrollable view with editable rows for each event.
