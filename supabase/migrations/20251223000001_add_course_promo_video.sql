-- Add promo_video_url field to courses table for promotional/intro videos
ALTER TABLE courses ADD COLUMN IF NOT EXISTS promo_video_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN courses.promo_video_url IS 'URL to promotional or introduction video (YouTube, Vimeo, etc.)';
