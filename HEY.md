# HEY - Action Items for You

> **Update this file at the end of each session** with new items or mark completed.

## What I Need From You

### For Next Session - Event Data
Please prepare the following for each of the 4 events:
1. **Event name** (e.g., "Quick Session", "Classic Banya")
2. **Description** (a few sentences about the event)
3. **Photo** (image file to upload)
4. **Price** (in your currency)
5. **Duration** (e.g., 30min, 1h, 2h)
6. **Calendly URL** (the booking link for each event)
7. **Any extra metadata** (max guests, what's included, etc.)

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

### Setup Tasks

- [x] Create Calendly Account
- [x] Create Calendly Event Types
- [x] Create Telegram Bot
- [x] Configure Calendly Webhook (local dev via ngrok)
- [ ] **Add Calendly Custom Questions** (optional but recommended)
  - "Phone number" (text, required)
  - "Number of guests" (dropdown: 1-8)
- [ ] **Connect Google Calendar to Calendly**
- [ ] **Create Supabase Admin User** for admin panel login (optional)

---

## Things Working Now

1. **Telegram Mini App** - http://localhost:3000
   - Event selection page with 3 events
   - Calendly iframe embed for booking

2. **Calendly Webhook** - Receiving bookings
   - Webhook URL: `https://inherently-national-leopard.ngrok-free.app/api/calendly/webhook`
   - Bookings sync to Supabase automatically

3. **Admin Panel** - http://localhost:3001
   - Bookings list with filters
   - Mark Paid button (works!)
   - Booking details with payment management

---

## What's Coming Next

**Events Management Admin Interface:**
- Table to store event types in Supabase
- Admin UI to create/edit/delete events
- Photo upload for each event
- Dynamic event display in Telegram app

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

---

## Status Legend
- Done
- Need (waiting for you)
- In Progress
- Blocked
