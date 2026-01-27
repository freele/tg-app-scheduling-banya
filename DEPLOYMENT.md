# Deployment Guide - Vercel

This guide covers deploying the Bania Booking System to Vercel.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│         Calendly (Booking Engine)                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ webhook
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                               │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │   telegram-app      │    │      admin          │        │
│  │   (Mini App)        │    │   (Admin Panel)     │        │
│  │ /api/calendly/webhook│    │                     │        │
│  └──────────┬──────────┘    └──────────┬──────────┘        │
└─────────────┼───────────────────────────┼──────────────────┘
              │                           │
              └───────────┬───────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase                               │
│                  (PostgreSQL + Auth)                        │
└─────────────────────────────────────────────────────────────┘
```

**Flow:**
1. User books via Calendly (embedded in telegram-app)
2. Calendly sends webhook to `telegram-app/api/calendly/webhook`
3. Webhook handler saves booking to Supabase
4. Admin panel reads bookings from Supabase

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub repository with the code pushed
- Supabase project already set up
- Calendly account configured

## Step 1: Deploy Telegram App

### 1.1 Create New Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure the project:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `apps/telegram-app` |
| Build Command | `cd ../.. && pnpm build --filter=@bania/telegram-app` |
| Output Directory | `.next` |
| Install Command | `pnpm install` |

### 1.2 Environment Variables

Add these environment variables in Vercel:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://cqjkmzejtzqfpxwlulrt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Telegram
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
NEXT_PUBLIC_TELEGRAM_WEBAPP_URL=https://your-telegram-app.vercel.app

# Calendly
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/banya-portugal
CALENDLY_WEBHOOK_SIGNING_KEY=your-calendly-pat-token

# App URL (set after first deploy, then redeploy)
NEXT_PUBLIC_APP_URL=https://your-telegram-app.vercel.app
```

### 1.3 Deploy

Click **Deploy** and wait for the build to complete.

Note the deployed URL (e.g., `https://bania-telegram.vercel.app`)

## Step 2: Deploy Admin Panel

### 2.1 Create New Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import the **same** GitHub repository
4. Configure the project:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `apps/admin` |
| Build Command | `cd ../.. && pnpm build --filter=@bania/admin` |
| Output Directory | `.next` |
| Install Command | `pnpm install` |

### 2.2 Environment Variables

Add the same environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://cqjkmzejtzqfpxwlulrt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Telegram (optional for admin)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
NEXT_PUBLIC_TELEGRAM_WEBAPP_URL=https://your-telegram-app.vercel.app

# Calendly
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/banya-portugal
CALENDLY_WEBHOOK_SIGNING_KEY=your-calendly-pat-token

# App URL
NEXT_PUBLIC_APP_URL=https://your-admin-app.vercel.app
```

### 2.3 Deploy

Click **Deploy** and wait for the build to complete.

Note the deployed URL (e.g., `https://bania-admin.vercel.app`)

## Step 3: Configure Webhooks

### 3.1 Calendly Webhook

Update the Calendly webhook to point to your production URL:

```bash
# First, get your current webhook subscriptions
curl -s "https://api.calendly.com/webhook_subscriptions?organization=https://api.calendly.com/organizations/YOUR_ORG_ID" \
  -H "Authorization: Bearer YOUR_PAT_TOKEN" | jq '.'

# Delete the old ngrok webhook (get the URI from above)
curl -X DELETE "https://api.calendly.com/webhook_subscriptions/WEBHOOK_ID" \
  -H "Authorization: Bearer YOUR_PAT_TOKEN"

# Create new production webhook
curl -X POST "https://api.calendly.com/webhook_subscriptions" \
  -H "Authorization: Bearer YOUR_PAT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-telegram-app.vercel.app/api/calendly/webhook",
    "events": ["invitee.created", "invitee.canceled"],
    "organization": "https://api.calendly.com/organizations/YOUR_ORG_ID",
    "scope": "organization"
  }'
```

### 3.2 Telegram Bot Webhook

Set the Telegram bot webhook to your production URL:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-telegram-app.vercel.app/api/telegram/webhook"
```

Verify the webhook is set:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## Step 4: Update App URLs

After both apps are deployed, update the environment variables with the actual URLs:

1. Go to each Vercel project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_TELEGRAM_WEBAPP_URL`
3. Redeploy both projects

## Step 5: Configure Telegram Mini App

1. Open [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/mybots` and select your bot
3. Click **Bot Settings** → **Menu Button** → **Configure Menu Button**
4. Enter your production URL: `https://your-telegram-app.vercel.app`

Or configure via API:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "Book Now",
      "web_app": {
        "url": "https://your-telegram-app.vercel.app"
      }
    }
  }'
```

## Troubleshooting

### Build Fails

**Error: Cannot find module '@bania/shared'**

Make sure the build command includes the monorepo root:
```
cd ../.. && pnpm build --filter=@bania/telegram-app
```

**Error: SUPABASE_SERVICE_ROLE_KEY is undefined**

Ensure the environment variable is added in Vercel dashboard (not just locally).

### Webhook Not Working

1. Check Vercel function logs: Project → Deployments → Functions → View Logs
2. Verify the webhook URL is correct
3. Test with curl:
```bash
curl -X POST https://your-app.vercel.app/api/calendly/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"invitee.created","payload":{...}}'
```

### Database Connection Issues

1. Verify Supabase URL and keys are correct
2. Check if RLS policies allow the operation
3. For server actions, ensure SUPABASE_SERVICE_ROLE_KEY is set

## Environment Variables Reference

| Variable | Required | Used By | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Both | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Both | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Both | Supabase service role key (server-side only) |
| `TELEGRAM_BOT_TOKEN` | Yes | telegram-app | Telegram bot token from BotFather |
| `NEXT_PUBLIC_TELEGRAM_WEBAPP_URL` | Yes | Both | Production URL of telegram-app |
| `NEXT_PUBLIC_CALENDLY_URL` | Yes | telegram-app | Base Calendly URL |
| `CALENDLY_WEBHOOK_SIGNING_KEY` | No | telegram-app | Calendly PAT for webhook verification |
| `NEXT_PUBLIC_APP_URL` | Yes | Both | Production URL of the respective app |

## Post-Deployment Checklist

- [ ] Telegram app accessible at production URL
- [ ] Admin panel accessible at production URL
- [ ] Calendly webhook configured for production
- [ ] Telegram bot webhook configured for production
- [ ] Test booking flow end-to-end
- [ ] Verify bookings appear in admin panel
- [ ] Test Mark Paid functionality
- [ ] Configure Telegram Mini App button in BotFather
