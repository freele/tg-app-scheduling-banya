#!/usr/bin/env node
/**
 * Upload event photos to Supabase Storage
 *
 * Usage: node scripts/upload-event-photos.mjs
 *
 * Run from project root (apps/admin must have @supabase/supabase-js installed)
 * Or run: cd apps/admin && node ../../scripts/upload-event-photos.mjs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import https from 'https';

// Configuration - update these values
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cqjkmzejtzqfpxwlulrt.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_feXuRsu-pOLt7aKvIWScSQ_qZPtQb9T';
const BUCKET_NAME = 'event-photos';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Event photos mapping - slug -> image URL
// Using Unsplash photos (free to use, banya/sauna themed)
const PHOTOS = [
  {
    slug: 'rental-no-master',
    url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80',
    description: 'Wooden sauna interior with benches'
  },
  {
    slug: 'program-with-master',
    url: 'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=800&q=80',
    description: 'Sauna with bucket and venik accessories'
  },
  {
    slug: 'saturday-women',
    url: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800&q=80',
    description: 'Spa wellness atmosphere'
  },
  {
    slug: 'saturday-men',
    url: 'https://images.unsplash.com/photo-1535530992830-e25d07cfa780?w=800&q=80',
    description: 'Classic wooden sauna interior'
  },
];

// Download image from URL
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error('Failed to download: ' + response.statusCode));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function uploadPhotos() {
  console.log('Starting photo upload...\n');

  for (const photo of PHOTOS) {
    try {
      // Get event by slug
      const { data: event, error: fetchError } = await supabase
        .from('events')
        .select('id, name, photo_url')
        .eq('slug', photo.slug)
        .single();

      if (fetchError || !event) {
        console.error('Event not found:', photo.slug);
        continue;
      }

      console.log('Processing:', event.name);
      console.log('  Description:', photo.description);

      // Download image
      console.log('  Downloading from Unsplash...');
      const imageBuffer = await downloadImage(photo.url);
      console.log('  Downloaded:', (imageBuffer.length / 1024).toFixed(1), 'KB');

      // Delete old photo if exists
      if (event.photo_url) {
        const oldFilename = event.photo_url.split('/').pop();
        await supabase.storage.from(BUCKET_NAME).remove([oldFilename]);
        console.log('  Removed old photo');
      }

      // Upload new photo
      const filename = event.id + '-' + Date.now() + '.jpg';
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filename, imageBuffer, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('  Upload failed:', uploadError.message);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filename);

      // Update event record
      const { error: updateError } = await supabase
        .from('events')
        .update({ photo_url: publicUrl })
        .eq('id', event.id);

      if (updateError) {
        console.error('  DB update failed:', updateError.message);
        continue;
      }

      console.log('  Uploaded:', publicUrl);
      console.log('');
    } catch (err) {
      console.error('Error processing', photo.slug, ':', err.message);
    }
  }

  console.log('Done!');
}

// Run if called directly
uploadPhotos();
