# HEY - Action Items for You

> **Update this file at the end of each session** with new items or mark completed.

## What I Need From You

### Ready for Deployment

Everything is built and working locally. When ready to deploy:

1. Create Vercel projects for both apps
2. Set environment variables in Vercel
3. Update Calendly webhook URL to production
4. Configure Telegram bot webhook for production

### Accounts & Credentials

| Item                 | Status | Notes                                 |
| -------------------- | ------ | ------------------------------------- |
| Supabase project     | Done   | `cqjkmzejtzqfpxwlulrt`                |
| Supabase service key | Done   | In `.env.local` files                 |
| Supabase anon key    | Done   | In `.env.local`                       |
| Calendly account     | Done   | <https://calendly.com/banya-portugal> |
| Calendly webhook     | Done   | Pointing to ngrok (local dev)         |
| Calendly PAT token   | Done   | In `.env.local`                       |
| Telegram bot token   | Done   | In `.env.local`                       |
| Google account       | Need   | For calendar sync (via Calendly)      |
| Vercel account       | Need   | For deployment                        |

---

## Things Working Now

1. **Telegram Mini App** - <http://localhost:3000>
   - Shows 4 events with photos, prices, duration
   - Calendly booking embedded for each event
   - Native Telegram theme support

2. **Admin Panel** - <http://localhost:3001>
   - **Events page** (`/dashboard/events`)
     - View all events with photos
     - Inline edit: name, price, duration, max guests, description
     - Photo upload (auto-resized to 800x600)
     - Toggle active/inactive status
     - Links to Calendly (Book/Manage)
   - **Bookings page** - view bookings, mark paid

3. **Calendly Webhook** - Receiving bookings
   - Webhook URL: Production (set via `make webhook URL=...`)
   - **Telegram user tracking** - Stores user ID for messaging capability

---

## Events in Database (with Photos)

| Event                       | Price | Duration | Photo          |
| --------------------------- | ----- | -------- | -------------- |
| Аренда бани без пармастера  | €340  | 4h       | Sauna interior |
| Программа Бережная баня     | €500  | 4h       | Sauna + venik  |
| Разовое посещение - женщины | €60   | 4h       | Spa atmosphere |
| Разовое посещение - мужчины | €60   | 4h       | Classic sauna  |

---

## Utility Scripts

### Re-upload Event Photos

```bash
cd apps/admin && node ../../scripts/upload-event-photos.mjs
```

Edit `scripts/upload-event-photos.mjs` to change photo URLs.

### Free Dev Ports

```bash
make free-ports
```

---

## What's Next

- [x] ~~Run migration~~ - `telegram_user_id` column added to bookings table
- [ ] Deploy to Vercel
- [ ] Test full flow in production

---

## Configured Values

### Calendly

- Base URL: `https://calendly.com/banya-portugal`
- Webhook subscription active (ngrok for local dev)

### Supabase

- All keys in `.env.local` for both apps
- Events table with 4 events + photos
- Storage bucket: `event-photos`

### Telegram Bot

- Token: Configured in `.env.local`

---

## Status Legend

- Done
- Need (waiting for you)
- In Progress
- Blocked
