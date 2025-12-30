-- Hide Months 2-12 by setting them to draft status
-- Month 1 (order_index = 1) remains live, all others become draft
-- This uses the existing RLS policies to hide drafts from regular users

UPDATE courses
SET status = 'draft'
WHERE order_index > 1
  AND order_index <= 12;

-- Add a comment for clarity
COMMENT ON TABLE courses IS 'Courses with order_index 2-12 are set to draft to show only Month 1 initially';
