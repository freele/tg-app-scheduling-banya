-- Bania Booking System - Calendly Integration
-- Simplified schema: single bookings table synced from Calendly webhooks

-- Create custom types (use DO block for IF NOT EXISTS)
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('scheduled', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- Bookings table (synced from Calendly)
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Calendly references
    calendly_event_uri TEXT UNIQUE NOT NULL,
    calendly_invitee_uri TEXT UNIQUE NOT NULL,

    -- Event details (from Calendly)
    event_type_name TEXT NOT NULL,
    event_type_uuid TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,

    -- Invitee details (from Calendly)
    invitee_name TEXT NOT NULL,
    invitee_email TEXT,
    invitee_phone TEXT,
    guests_count INTEGER NOT NULL DEFAULT 1 CHECK (guests_count > 0),

    -- Status
    status booking_status NOT NULL DEFAULT 'scheduled',

    -- Payment tracking (managed in admin panel)
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_amount DECIMAL(10, 2),
    payment_notes TEXT,

    -- Additional info
    notes TEXT,
    calendly_payload JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes (use IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_invitee_email ON bookings(invitee_email);
CREATE INDEX IF NOT EXISTS idx_bookings_upcoming ON bookings(start_time, status)
    WHERE status = 'scheduled';

-- ============================================
-- Functions
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at (drop and recreate to be idempotent)
DROP TRIGGER IF EXISTS trigger_bookings_updated_at ON bookings;
CREATE TRIGGER trigger_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for webhook handler)
DROP POLICY IF EXISTS "Service role has full access" ON bookings;
CREATE POLICY "Service role has full access"
    ON bookings FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Authenticated users (admins) can view and update all bookings
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
CREATE POLICY "Admins can view all bookings"
    ON bookings FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update bookings" ON bookings;
CREATE POLICY "Admins can update bookings"
    ON bookings FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- Views for admin dashboard
-- ============================================

-- Upcoming bookings view
CREATE OR REPLACE VIEW upcoming_bookings AS
SELECT
    id,
    event_type_name,
    start_time,
    end_time,
    invitee_name,
    invitee_phone,
    guests_count,
    status,
    payment_status,
    payment_amount
FROM bookings
WHERE start_time >= NOW()
  AND status = 'scheduled'
ORDER BY start_time ASC;

-- Today's bookings view
CREATE OR REPLACE VIEW todays_bookings AS
SELECT
    id,
    event_type_name,
    start_time,
    end_time,
    invitee_name,
    invitee_phone,
    guests_count,
    status,
    payment_status
FROM bookings
WHERE DATE(start_time) = CURRENT_DATE
  AND status = 'scheduled'
ORDER BY start_time ASC;
