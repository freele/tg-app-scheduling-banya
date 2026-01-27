-- Events Table - Store event types from Calendly
-- This allows admin to manage events metadata (photos, display order, etc.)
-- while keeping sync with Calendly for scheduling

-- ============================================
-- Events table
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic info
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description_html TEXT,
    description_plain TEXT,

    -- Media
    photo_url TEXT,

    -- Pricing & Duration
    price DECIMAL(10, 2),
    currency TEXT NOT NULL DEFAULT 'EUR',
    duration INTEGER NOT NULL, -- in minutes

    -- Calendly integration
    calendly_url TEXT NOT NULL, -- booking URL (e.g., https://calendly.com/banya-portugal/30min)
    calendly_event_uri TEXT UNIQUE, -- API reference (e.g., https://api.calendly.com/event_types/...)
    calendly_event_uuid TEXT, -- UUID extracted from URI

    -- Capacity
    max_guests INTEGER DEFAULT 8,

    -- Display settings
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    color TEXT, -- Calendly color (for UI hints)

    -- Metadata (extra info: internal notes, what's included, etc.)
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_display_order ON events(display_order);
CREATE INDEX IF NOT EXISTS idx_events_calendly_event_uri ON events(calendly_event_uri);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_events_updated_at ON events;
CREATE TRIGGER trigger_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
DROP POLICY IF EXISTS "Service role has full access to events" ON events;
CREATE POLICY "Service role has full access to events"
    ON events FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Anyone can view active events (for Telegram app)
DROP POLICY IF EXISTS "Anyone can view active events" ON events;
CREATE POLICY "Anyone can view active events"
    ON events FOR SELECT
    USING (is_active = true);

-- Authenticated users (admins) can view all events
DROP POLICY IF EXISTS "Admins can view all events" ON events;
CREATE POLICY "Admins can view all events"
    ON events FOR SELECT
    USING (auth.role() = 'authenticated');

-- Authenticated users (admins) can update events
DROP POLICY IF EXISTS "Admins can update events" ON events;
CREATE POLICY "Admins can update events"
    ON events FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users (admins) can insert events
DROP POLICY IF EXISTS "Admins can insert events" ON events;
CREATE POLICY "Admins can insert events"
    ON events FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users (admins) can delete events
DROP POLICY IF EXISTS "Admins can delete events" ON events;
CREATE POLICY "Admins can delete events"
    ON events FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================
-- Seed initial data from Calendly
-- ============================================

INSERT INTO events (name, slug, description_html, description_plain, price, duration, calendly_url, calendly_event_uri, calendly_event_uuid, max_guests, display_order, color, metadata) VALUES
(
    'Аренда бани без пармастера (4 часа, до 8 человек)',
    'rental-no-master',
    '<p><strong>В услугу включено: </strong></p><ul>
<li>просторная парная на 4 ч.+ 1 ч. на въезд/выезд,</li>
<li>2 комнаты отдыха </li>
<li>2 веника на группу</li>
<li>шапочки и простыня каждому парильщику, </li>
<li>аромасмасла (при желании)</li>
<li>обливное ведро, </li>
<li>уютное чаепитие после парения. </li>
</ul><p>Цена за группу от 5 до 8 человек - 340€. </p>',
    'В услугу включено: просторная парная на 4 ч.+ 1 ч. на въезд/выезд, 2 комнаты отдыха, 2 веника на группу, шапочки и простыня каждому парильщику, аромасмасла (при желании), обливное ведро, уютное чаепитие после парения.',
    340.00,
    240,
    'https://calendly.com/banya-portugal/30min',
    'https://api.calendly.com/event_types/0bb0256c-d1a1-44be-922b-109a3cbdc0cb',
    '0bb0256c-d1a1-44be-922b-109a3cbdc0cb',
    8,
    0,
    '#ccf000',
    '{"internal_note": "Включено: просторная парная и комната отдыха на 4 ч.+ 1 ч. на въезд/выезд, 2 веника, шапочки для парения, простыни, обливное ведро, чаепитие. Цена 340€"}'::jsonb
),
(
    'Программа Бережная баня, с пармастером (4 часа, до 8 чел)',
    'program-with-master',
    '<p><strong>Бережная баня </strong>- это полноценная программа парения.</p><p><strong>В услугу включено: </strong></p><ul>
<li>просторная парная на 4 ч.+ 1 ч. на въезд/выезд,</li>
<li>парение пармастером</li>
<li>солевое обертывание</li>
<li>обкатывание</li>
</ul><p><br></p><p>А также:</p><ul>
<li>2 комнаты отдыха</li>
<li>2 веника на группу</li>
<li>шапочки и простыня каждому парильщику,</li>
<li>аромасмасла (при желании)</li>
<li>обливное ведро,</li>
<li>уютное чаепитие после парения.</li>
</ul><p>Цена за группу от 5 до 8 человек - 500€. </p>',
    'Бережная баня - это полноценная программа парения. В услугу включено: просторная парная на 4 ч.+ 1 ч. на въезд/выезд, парение пармастером, солевое обертывание, обкатывание. А также: 2 комнаты отдыха, 2 веника на группу, шапочки и простыня каждому парильщику, аромасмасла (при желании), обливное ведро, уютное чаепитие после парения.',
    500.00,
    240,
    'https://calendly.com/banya-portugal/clone',
    'https://api.calendly.com/event_types/f40cb4f8-44be-4eb2-99bc-3f287c2dec55',
    'f40cb4f8-44be-4eb2-99bc-3f287c2dec55',
    8,
    1,
    '#17e885',
    '{"internal_note": "Включено: программа на 4 ч.+ 1 ч. на въезд/выезд, 3 веника, шапочки для парения, простыни, обливное ведро, чаепитие. Цена 500€"}'::jsonb
),
(
    'Разовое посещение по субботам (женщины)',
    'saturday-women',
    '<p><strong>В услугу включено: </strong></p><ul>
<li>просторная парная на 4 ч.+ 1 ч. на въезд/выезд,</li>
<li>2 комнаты отдыха</li>
<li>1 веника</li>
<li>шапочка и простыня,</li>
<li>аромасмасла (при желании)</li>
<li>обливное ведро,</li>
<li>уютное чаепитие после парения.</li>
</ul><p>Цена за сеанс на 1 человека - 60€. </p>',
    'В услугу включено: просторная парная на 4 ч.+ 1 ч. на въезд/выезд, 2 комнаты отдыха, 1 веника, шапочка и простыня, аромасмасла (при желании), обливное ведро, уютное чаепитие после парения.',
    60.00,
    240,
    'https://calendly.com/banya-portugal/meet-with-me',
    'https://api.calendly.com/event_types/fe0d3e9f-bee6-42ae-9f62-1f0086537039',
    'fe0d3e9f-bee6-42ae-9f62-1f0086537039',
    1,
    2,
    '#0ae8f0',
    '{"gender": "women", "day": "saturday"}'::jsonb
),
(
    'Разовое посещение по субботам (мужчины)',
    'saturday-men',
    '<p><strong>В услугу включено: </strong></p><ul>
<li>просторная парная на 4 ч.+ 1 ч. на въезд/выезд,</li>
<li>2 комнаты отдыха</li>
<li>1 веника</li>
<li>шапочка и простыня,</li>
<li>аромасмасла (при желании)</li>
<li>обливное ведро,</li>
<li>уютное чаепитие после парения.</li>
</ul><p>Цена за сеанс на 1 человека - 60€. </p>',
    'В услугу включено: просторная парная на 4 ч.+ 1 ч. на въезд/выезд, 2 комнаты отдыха, 1 веника, шапочка и простыня, аромасмасла (при желании), обливное ведро, уютное чаепитие после парения.',
    60.00,
    240,
    'https://calendly.com/banya-portugal/clone-1',
    'https://api.calendly.com/event_types/481dd9ff-f386-4d72-a7be-29048817661f',
    '481dd9ff-f386-4d72-a7be-29048817661f',
    1,
    3,
    '#0099ff',
    '{"gender": "men", "day": "saturday"}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
