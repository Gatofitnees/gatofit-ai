
-- 1. Create a new storage bucket for exercise thumbnails
-- This will store the generated images from videos.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('exercise-thumbnails', 'exercise-thumbnails', TRUE, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 1048576,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Set up RLS policies for public read access to the new bucket
-- Drop existing policy if it exists to avoid errors on re-run
DROP POLICY IF EXISTS "Public read access for exercise thumbnails" ON storage.objects;

-- Create policy for public read access
CREATE POLICY "Public read access for exercise thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'exercise-thumbnails');

-- 3. Add image_url and thumbnail_url columns to the exercises table
-- image_url for user-uploaded static images, and thumbnail_url for generated video frames.
ALTER TABLE public.exercises
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

