# Bania Booking System - Runbook

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- ngrok (`brew install ngrok` or download from ngrok.com)
- Environment variables configured in `.env.local`

---

## 1. Local Testing - Admin Panel

### Start the Admin Panel

```bash
# Install dependencies (if not done)
pnpm install

# Start admin panel on port 3001
pnpm --filter @bania/admin dev
```

Access at: **http://localhost:3001**

### Test Admin Features

1. **Login**: Go to http://localhost:3001/login
   - Use the admin credentials you created in Supabase Auth
   - If no admin user exists, create one in Supabase Dashboard → Authentication → Users

2. **Dashboard**: http://localhost:3001/dashboard
   - View stats (will be empty initially)
   - See upcoming bookings

3. **Bookings List**: http://localhost:3001/dashboard/bookings
   - Filter by status, payment status
   - Search by name/email/phone

4. **Booking Detail**: Click any booking to view/edit payment status

---

## 2. Local Testing - Telegram Mini App

### Start the Telegram App

```bash
# In a new terminal
pnpm --filter @bania/telegram-app dev
```

Access at: **http://localhost:3000**

### Test Calendly Embed

1. Open http://localhost:3000 in browser
2. You should see the Calendly booking widget
3. Test making a booking (use test email)

---

## 3. Telegram Bot Testing with ngrok

### Why ngrok?

Telegram webhooks require a public HTTPS URL. ngrok creates a tunnel from a public URL to your localhost.

### Setup ngrok

```bash
# Start ngrok tunnel to telegram-app (port 3000)
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

### Configure Telegram Bot Webhook

```bash
# Set the webhook URL for your bot
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://abc123.ngrok-free.app/api/telegram/webhook"}'

# Verify webhook is set
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

Replace:
- `<YOUR_BOT_TOKEN>` with your actual bot token from `.env.local`
- `abc123.ngrok-free.app` with your ngrok URL

### Configure Mini App URL in BotFather

1. Open Telegram, message @BotFather
2. `/mybots` → Select your bot
3. Bot Settings → Menu Button → Configure menu button
4. Set URL to: `https://abc123.ngrok-free.app`

### Test the Bot

1. Open your bot in Telegram
2. Send `/start` - should show "Book a Session" button
3. Click the button - Mini App should open with Calendly
4. Make a test booking

### Update .env.local for ngrok

```env
NEXT_PUBLIC_TELEGRAM_WEBAPP_URL=https://abc123.ngrok-free.app
```

Restart the dev server after changing env vars.

---

## 4. Testing Calendly Webhook

### Local Testing with ngrok

The Calendly webhook needs a public URL to receive booking notifications.

```bash
# If ngrok is already running on port 3000, use that URL
# Webhook endpoint: https://abc123.ngrok-free.app/api/calendly/webhook
```

### Configure Calendly Webhook (for local testing)

1. Go to Calendly → Integrations → Webhooks
2. Create webhook subscription with:
   - URL: `https://abc123.ngrok-free.app/api/calendly/webhook`
   - Events: `invitee.created`, `invitee.canceled`

Or use the Calendly API:

```bash
curl -X POST "https://api.calendly.com/webhook_subscriptions" \
  -H "Authorization: Bearer <YOUR_CALENDLY_PAT>" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://abc123.ngrok-free.app/api/calendly/webhook",
    "events": ["invitee.created", "invitee.canceled"],
    "organization": "https://api.calendly.com/organizations/<ORG_UUID>",
    "scope": "organization"
  }'
```

### Test Webhook Manually

```bash
# Health check
curl https://abc123.ngrok-free.app/api/calendly/webhook

# Should return: {"ok":true,"message":"Calendly webhook endpoint",...}
```

### Monitor Webhook Calls

Watch ngrok dashboard at http://localhost:4040 to see incoming webhook requests.

---

## 5. Full End-to-End Test Flow

1. **Start services**:
   ```bash
   # Terminal 1: Telegram app
   pnpm --filter @bania/telegram-app dev

   # Terminal 2: Admin panel
   pnpm --filter @bania/admin dev

   # Terminal 3: ngrok
   ngrok http 3000
   ```

2. **Configure webhooks** (as described above)

3. **Test booking flow**:
   - Open Telegram bot → Click "Book a Session"
   - Complete Calendly booking
   - Check ngrok dashboard for webhook call
   - Check admin panel for new booking
   - Update payment status in admin

4. **Test cancellation**:
   - Cancel booking in Calendly (via email link)
   - Verify status updated in admin panel

---

## 6. Troubleshooting

### "TELEGRAM_BOT_TOKEN is not set"
- Check `.env.local` has the token
- Restart the dev server

### "supabaseUrl is required"
- Check `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`
- Restart the dev server

### Webhook not receiving calls
- Check ngrok is running
- Verify webhook URL is correct
- Check ngrok dashboard (http://localhost:4040) for errors

### Admin login not working
- Create user in Supabase Dashboard → Authentication → Users
- Check RLS policies allow authenticated users

### Calendly embed not showing
- Check `NEXT_PUBLIC_CALENDLY_URL` is set correctly
- Verify the Calendly event is published (not draft)

---

## Quick Commands Reference

```bash
# Start all dev servers
pnpm dev                          # Runs both apps via turbo

# Start individual apps
pnpm --filter @bania/telegram-app dev   # Port 3000
pnpm --filter @bania/admin dev          # Port 3001

# Build
pnpm build

# Type check
pnpm type-check

# ngrok
ngrok http 3000

# Set Telegram webhook
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d "url=https://YOUR_NGROK_URL/api/telegram/webhook"

# Check Telegram webhook
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"

# Delete Telegram webhook (for cleanup)
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/deleteWebhook"
```
