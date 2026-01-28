-- Add Telegram user ID to bookings for messaging capability
-- This column stores the Telegram user ID when booking is made via Mini App

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT;

-- Index for looking up bookings by Telegram user
CREATE INDEX IF NOT EXISTS idx_bookings_telegram_user_id ON bookings(telegram_user_id);

-- Comment for documentation
COMMENT ON COLUMN bookings.telegram_user_id IS 'Telegram user ID for direct messaging (from Mini App bookings)';
