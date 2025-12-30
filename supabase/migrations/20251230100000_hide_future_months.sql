-- Hide Months 2-12 by setting them to draft status
-- Month 1 remains live, all others become draft
-- This uses the existing RLS policies to hide drafts from regular users

-- Update by order_index if set
UPDATE courses
SET status = 'draft'
WHERE order_index > 1
  AND order_index <= 12;

-- Also update by title pattern for courses without order_index
UPDATE courses
SET status = 'draft'
WHERE title LIKE 'Month %:%'
  AND title NOT LIKE 'Month 1:%';

-- Add a comment for clarity
COMMENT ON TABLE courses IS 'Courses with order_index 2-12 are set to draft to show only Month 1 initially';
