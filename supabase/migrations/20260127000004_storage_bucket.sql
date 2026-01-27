-- Create storage bucket for event photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-photos',
  'event-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view photos
CREATE POLICY "Public can view event photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-photos');

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload event photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-photos' AND auth.role() = 'authenticated');

-- Allow service role full access
CREATE POLICY "Service role has full access to event photos"
ON storage.objects FOR ALL
USING (bucket_id = 'event-photos' AND auth.role() = 'service_role');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete event photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'event-photos' AND auth.role() = 'authenticated');
