-- Fix: Hide Months 2-12 by title pattern
-- The previous migration may not have matched if order_index wasn't set

UPDATE courses
SET status = 'draft'
WHERE title LIKE 'Month %:%'
  AND title NOT LIKE 'Month 1:%';
