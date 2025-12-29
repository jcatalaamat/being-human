-- Add deletion_requested_at column to profiles table for iOS App Store compliance
-- This allows users to request account deletion per Apple's guidelines

ALTER TABLE profiles
ADD COLUMN deletion_requested_at timestamptz DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN profiles.deletion_requested_at IS 'Timestamp when user requested account deletion. NULL means no deletion requested.';
