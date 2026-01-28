#!/bin/bash
#
# Set Calendly webhook URL
# Usage: ./scripts/set-calendly-webhook.sh <webhook_url>
#
# Example:
#   ./scripts/set-calendly-webhook.sh https://example.vercel.app/api/calendly/webhook
#

set -e

WEBHOOK_URL="$1"

if [ -z "$WEBHOOK_URL" ]; then
  echo "Usage: $0 <webhook_url>"
  echo "Example: $0 https://tg-app-scheduling-banya-telegram-ap.vercel.app/api/calendly/webhook"
  exit 1
fi

# Calendly API token (from .env.local)
CALENDLY_TOKEN="eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzY5NTE0ODU2LCJqdGkiOiJlY2Q2ZDg0YS1hZGE5LTRmOGItOGNiNy01ZmI5YjkxYmQwNGYiLCJ1c2VyX3V1aWQiOiI0YTI1ODhkOC1lOTE3LTQzNzUtYTQyNS1hYTY0YmI4MWUxYzIifQ.rfntpytIh4AcRLpzhvzNxpkDuRNTKXpbg2WIXctDAr7DLzsugXFmm-Y6Dyy3nHvqkGI8XqCk7wI9_kiQpF_czA"

echo "Getting organization..."
ORG=$(curl -s "https://api.calendly.com/users/me" \
  -H "Authorization: Bearer $CALENDLY_TOKEN" | jq -r '.resource.current_organization')

echo "Organization: $ORG"

echo "Checking existing webhooks..."
EXISTING=$(curl -s "https://api.calendly.com/webhook_subscriptions?organization=$ORG&scope=organization" \
  -H "Authorization: Bearer $CALENDLY_TOKEN")

# Delete existing webhooks
echo "$EXISTING" | jq -r '.collection[].uri' | while read uri; do
  if [ -n "$uri" ] && [ "$uri" != "null" ]; then
    echo "Deleting: $uri"
    curl -s -X DELETE "$uri" -H "Authorization: Bearer $CALENDLY_TOKEN"
  fi
done

echo "Creating new webhook: $WEBHOOK_URL"
RESULT=$(curl -s -X POST "https://api.calendly.com/webhook_subscriptions" \
  -H "Authorization: Bearer $CALENDLY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "'"$WEBHOOK_URL"'",
    "events": ["invitee.created", "invitee.canceled"],
    "organization": "'"$ORG"'",
    "scope": "organization"
  }')

STATE=$(echo "$RESULT" | jq -r '.resource.state')
CALLBACK=$(echo "$RESULT" | jq -r '.resource.callback_url')

if [ "$STATE" = "active" ]; then
  echo ""
  echo "Webhook created successfully!"
  echo "  URL: $CALLBACK"
  echo "  State: $STATE"
  echo "  Events: invitee.created, invitee.canceled"
else
  echo "Error creating webhook:"
  echo "$RESULT" | jq .
  exit 1
fi
