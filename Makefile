# Bania Development Makefile

.PHONY: free-ports dev build webhook

# Kill processes on development ports (3000, 3001)
free-ports:
	@echo "Freeing ports 3000 and 3001..."
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@lsof -ti:3001 | xargs kill -9 2>/dev/null || true
	@echo "Done!"

# Start development servers
dev:
	pnpm dev

# Build all apps
build:
	pnpm build

# Set Calendly webhook URL
# Usage: make webhook URL=https://your-app.vercel.app/api/calendly/webhook
webhook:
	@./scripts/set-calendly-webhook.sh $(URL)
