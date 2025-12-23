# Supabase Setup Guide for Egon Courses Platform

## Prerequisites

1. **Supabase Account**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project

2. **Supabase CLI** (optional but recommended)
   ```bash
   npm install -g supabase
   ```

## Setup Steps

### Option 1: Using Supabase Dashboard (Easiest)

1. **Navigate to SQL Editor** in your Supabase project dashboard

2. **Run the Migration**
   - Copy the contents of `/supabase/migrations/20251222000000_create_courses_schema.sql`
   - Paste into the SQL Editor
   - Click "Run"
   - This creates all tables, indexes, RLS policies, and functions

3. **Seed Sample Data** (Optional)
   - Copy the contents of `/supabase/seed.sql`
   - Paste into the SQL Editor
   - Click "Run"
   - This creates 3 sample courses with modules and lessons

4. **Get Your Project Credentials**
   - Go to Project Settings > API
   - Copy:
     - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
     - `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### Option 2: Using Supabase CLI (Advanced)

1. **Link Your Project**
   ```bash
   cd /path/to/egon
   supabase link --project-ref YOUR_PROJECT_REF
   ```

2. **Push Migration**
   ```bash
   supabase db push
   ```

3. **Seed Data** (Optional)
   ```bash
   supabase db reset --seed
   ```
   Or manually:
   ```bash
   psql YOUR_DATABASE_URL -f supabase/seed.sql
   ```

## Environment Variables

Create/update your `.env.local` files:

### For Web (apps/next/.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### For Mobile (apps/expo/.env.local)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Switch from Mock Data to Real Database

Once your database is set up, switch the API to use real data:

1. **Update Router Flags**
   Edit these files and change `USE_MOCK_DATA = true` to `USE_MOCK_DATA = false`:
   - `/packages/api/src/routers/courses.ts`
   - `/packages/api/src/routers/lessons.ts`
   - `/packages/api/src/routers/progress.ts`

2. **Commit the Changes**
   ```bash
   git add packages/api/src/routers/*.ts
   git commit -m "Switch to real database from mock data"
   ```

## Database Schema Overview

### Tables Created

1. **courses** - Course catalog
   - `id`, `title`, `description`, `cover_url`, `instructor_id`, `is_published`
   - RLS: Published courses viewable by all, instructors manage their own

2. **modules** - Course sections/chapters
   - `id`, `course_id`, `title`, `description`, `order_index`
   - RLS: Viewable if course is accessible

3. **lessons** - Individual lesson content
   - `id`, `module_id`, `title`, `description`, `lesson_type` (video/audio/pdf/text)
   - `content_url`, `content_text`, `duration_sec`, `order_index`
   - RLS: Viewable if module is accessible

4. **user_course_progress** - Track enrollment and overall progress
   - `id`, `user_id`, `course_id`, `last_lesson_id`, `started_at`, `last_accessed_at`
   - RLS: Users can only view/modify their own progress

5. **user_lesson_progress** - Track individual lesson completion
   - `id`, `user_id`, `lesson_id`, `is_complete`, `completed_at`, `last_position_sec`
   - RLS: Users can only view/modify their own progress

### Functions

- **calculate_course_progress(user_id, course_id)**
  - Returns progress percentage (0-100)
  - Used in tRPC routers to show completion %

### Indexes

Optimized indexes for:
- Module/lesson ordering
- User progress lookups
- Course filtering

## Testing the Setup

1. **Sign Up a User**
   - Use the app's sign-up flow
   - Or create a user in Supabase Dashboard > Authentication

2. **Create a Course via Admin Panel**
   - Navigate to Admin tab
   - Click "Create Course"
   - Fill in title, description, cover URL
   - Mark as "Published"

3. **Add Modules and Lessons**
   - Click on your course
   - Create modules with order index (1, 2, 3...)
   - Create lessons within modules

4. **Test Progress Tracking**
   - Navigate to a course as a regular user
   - Start lessons
   - Mark lessons complete
   - Verify progress % updates

## Sample Data

The seed file (`supabase/seed.sql`) includes:

- **3 Courses:**
  1. Introduction to React (3 modules, 8 lessons)
  2. Advanced TypeScript (2 modules, 3 lessons)
  3. React Native Fundamentals (1 module, 2 lessons)

- **Lesson Types:**
  - Video lessons with sample URLs
  - Text lessons with markdown content
  - Audio lessons

All using the first authenticated user as instructor.

## Row Level Security (RLS)

The migration enables RLS on all tables with these policies:

- **Courses**:
  - Anyone can view published courses
  - Instructors can manage their own courses

- **Modules/Lessons**:
  - Follow parent course permissions
  - Instructors manage their own content

- **Progress Tables**:
  - Users can only access their own progress
  - Prevents data leaks between users

## Troubleshooting

### "relation does not exist" errors
- Make sure migration ran successfully
- Check SQL Editor for error messages
- Try running migration manually

### RLS Policy Errors
- Verify user is authenticated
- Check that user ID matches policy requirements
- Use Supabase Dashboard > Table Editor to test queries

### No data appearing
- Verify `USE_MOCK_DATA = false` in router files
- Check network tab for tRPC errors
- Verify environment variables are set correctly

### Permission denied errors
- Check RLS policies are correct
- Verify user is authenticated
- For admin operations, ensure user owns the course

## Admin Access

Currently, all authenticated users can create courses. To restrict admin access:

1. Add `is_admin` column to profiles table
2. Update RLS policies to check `is_admin = true`
3. Update admin router to check permissions

## Next Steps

1. ✅ Run migration to create tables
2. ✅ Seed sample data (optional)
3. ✅ Update environment variables
4. ✅ Switch `USE_MOCK_DATA` to `false`
5. ✅ Test course creation and progress tracking
6. 🎯 Deploy to production (see [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md))
7. 🎯 Add custom domain (optional)
8. 🎯 Configure email templates (optional)

## Full Deployment Guide

For a comprehensive step-by-step guide to switching from mock data to production database, see:

📋 **[DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md)**

This includes:
- Complete setup workflow
- Testing checklist
- Troubleshooting guide
- Production deployment steps
- Rollback procedures

## Production Checklist

- [ ] Database migration applied
- [ ] RLS policies verified
- [ ] Environment variables set
- [ ] Mock data disabled
- [ ] Admin permissions configured
- [ ] Email templates customized
- [ ] Backup strategy in place
- [ ] Monitoring enabled

## Support

For issues:
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- tRPC Docs: https://trpc.io
