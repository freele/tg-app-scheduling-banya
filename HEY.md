# HEY - Action Items for You

> **Update this file at the end of each session** with new items or mark completed.

## What I Need From You

### Photos for Events (Optional)

You can add photos to events by either:

1. **Manual URL** - Edit each event in admin panel, paste a photo URL
2. **Upload feature** - We can add Supabase Storage upload in next session

### Accounts & Credentials

| Item                 | Status | Notes                            |
| -------------------- | ------ | -------------------------------- |
| Supabase project     | Done | `cqjkmzejtzqfpxwlulrt`           |
| Supabase service key | Done | In `.env.local` files            |
| Supabase anon key    | Done | In `.env.local`                  |
| Calendly account     | Done | https://calendly.com/banya-portugal |
| Calendly webhook     | Done | Pointing to ngrok (local dev)    |
| Calendly PAT token   | Done | In `.env.local`                  |
| Telegram bot token   | Done | In `.env.local`                  |
| Google account       | Need | For calendar sync (via Calendly) |

---

## Things Working Now

1. **Telegram Mini App** - http://localhost:3000
   - Fetches events dynamically from Supabase
   - Shows all 4 events with prices, duration, max guests
   - Calendly booking embedded for each event

2. **Calendly Webhook** - Receiving bookings
   - Webhook URL: `https://inherently-national-leopard.ngrok-free.app/api/calendly/webhook`
   - Bookings sync to Supabase automatically

3. **Admin Panel** - http://localhost:3001
   - **Events page** (`/dashboard/events`) - NEW!
     - View all events from database
     - Inline edit: name, price, duration, max guests, description
     - Toggle active/inactive status
     - "Book" link - test booking flow
     - "Manage" link - edit in Calendly
     - Delete events
   - **Bookings page** - view bookings, mark paid
   - **Booking details** - payment management

---

## Events in Database

The following 4 events were synced from Calendly:

| Event | Price | Duration | Max Guests |
|-------|-------|----------|------------|
| Аренда бани без пармастера | €340 | 4h | 8 |
| Программа Бережная баня (с пармастером) | €500 | 4h | 8 |
| Разовое посещение - женщины | €60 | 4h | 1 |
| Разовое посещение - мужчины | €60 | 4h | 1 |

---

## What's Coming Next

**Optional improvements:**
- Photo upload for events (Supabase Storage)
- "Sync from Calendly" button
- Deploy to Vercel

---

## Configured Values

### Calendly
- Base URL: `https://calendly.com/banya-portugal`
- Webhook subscription active (ngrok for local dev)

### Telegram Bot
- Token: Configured in `.env.local`

### Supabase
- All keys in `.env.local` for both apps
- Service role key needed for server actions
- Events table created with 4 events

---

## Status Legend
- Done
- Need (waiting for you)
- In Progress
- Blocked
