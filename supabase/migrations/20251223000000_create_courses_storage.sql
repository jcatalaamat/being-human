-- Create a public bucket for course assets (images, videos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'courses',
  'courses',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to course assets
CREATE POLICY "Public read access for course assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'courses');

-- Allow authenticated users to upload (for admin/instructor use)
CREATE POLICY "Authenticated users can upload course assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'courses');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update course assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'courses');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete course assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'courses');
