-- Add order_index to courses for custom sorting
ALTER TABLE courses ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_courses_order ON courses(tenant_id, order_index);
