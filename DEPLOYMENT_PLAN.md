# Deployment Plan: Switch from Mock Data to Real Database

## Overview
This document outlines the step-by-step process to transition the Egon Courses Platform from using mock data to a live Supabase database with seed data.

## Prerequisites Checklist

- [ ] Supabase account created at [supabase.com](https://supabase.com)
- [ ] New Supabase project created
- [ ] Project URL and anon key available
- [ ] Local `.env` file ready to update

## Phase 1: Supabase Project Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Enter project details:
   - **Name**: `egon-courses` (or your preferred name)
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose closest to your users
4. Wait for project to finish setting up (~2 minutes)

### 1.2 Get Project Credentials

1. Navigate to **Project Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **Project Ref** (e.g., `xxxxx` from the URL)

**IMPORTANT**: Keep these credentials secure. Never commit them to version control.

## Phase 2: Run Database Migration

### Option A: Via Supabase Dashboard (Recommended for First-Time)

1. Navigate to **SQL Editor** in your Supabase dashboard
2. Open the migration file at `/supabase/migrations/20251222000000_create_courses_schema.sql`
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run** or press `Cmd/Ctrl + Enter`
6. Verify success: Check for green "Success" message

**Troubleshooting**: If you see errors:
- Check if tables already exist (re-running is safe due to `IF NOT EXISTS`)
- Verify RLS is enabled
- Check for syntax errors in the SQL

### Option B: Via Supabase CLI (Advanced)

```bash
# From project root
cd /path/to/egon

# Link your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations to remote
supabase db push
```

## Phase 3: Seed Initial Data

### 3.1 Run Seed File

**Via Dashboard:**
1. Go to **SQL Editor**
2. Open `/supabase/seed.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click **Run**

**Via psql (if you have database password):**
```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  -f supabase/seed.sql
```

### 3.2 Verify Seed Data

1. Go to **Table Editor** in Supabase dashboard
2. Check the following tables have data:
   - **courses**: Should have 3 courses (React, TypeScript, React Native)
   - **modules**: Should have 6 modules total
   - **lessons**: Should have 13 lessons total
3. Verify sample data looks correct

## Phase 4: Update Environment Variables

### 4.1 Update Root `.env` File

```bash
# Navigate to project root
cd /path/to/egon

# Edit .env file (create from .env.example if needed)
# Replace the following values:
```

**Update these lines:**
```env
# Change from localhost to your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
NEXT_PUBLIC_PROJECT_ID=YOUR_PROJECT_REF

EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
```

**Important Notes:**
- Keep `NEXT_PUBLIC_URL` and `EXPO_PUBLIC_URL` as `http://localhost:3000` for local development
- Never commit `.env` file to git (already in `.gitignore`)
- For production deployment, set these as environment variables in your hosting platform

### 4.2 Create Environment-Specific Files (Optional)

For different environments:

**Development (`.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
```

**Production (set in Vercel/hosting platform):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
```

## Phase 5: Switch to Real Database

### 5.1 Update Router Files

Update the `USE_MOCK_DATA` flag in these three files:

**File 1: `/packages/api/src/routers/courses.ts`**
```typescript
// Line 8
const USE_MOCK_DATA = false  // Change from true to false
```

**File 2: `/packages/api/src/routers/lessons.ts`**
```typescript
// Line 8
const USE_MOCK_DATA = false  // Change from true to false
```

**File 3: `/packages/api/src/routers/progress.ts`**
```typescript
// Line 7
const USE_MOCK_DATA = false  // Change from true to false
```

### 5.2 Restart Development Servers

```bash
# Stop all running processes (Ctrl+C)

# Clear caches and restart
npx expo start --clear  # For mobile
yarn web                # For web (in separate terminal)
```

## Phase 6: Testing & Verification

### 6.1 Test User Authentication

1. **Sign up a new user:**
   - Open app (web or mobile)
   - Navigate to sign-up screen
   - Create account with email/password
   - Check email for confirmation link
   - Confirm email

2. **Verify user in Supabase:**
   - Go to **Authentication** → **Users** in Supabase dashboard
   - Confirm new user appears

### 6.2 Test Course Viewing

**Test Checklist:**
- [ ] Navigate to Library screen
- [ ] Verify 3 seed courses appear:
  - Introduction to React
  - Advanced TypeScript
  - React Native Fundamentals
- [ ] Click on "Introduction to React"
- [ ] Verify 3 modules appear
- [ ] Click on first module "Getting Started"
- [ ] Verify 3 lessons appear

### 6.3 Test Lesson Viewing

**Test Checklist:**
- [ ] Click on "Welcome to React" lesson
- [ ] Verify lesson loads with video player (stub)
- [ ] Click "Mark Complete" button
- [ ] Verify completion state persists
- [ ] Navigate back to course detail
- [ ] Verify lesson shows as complete (check icon)
- [ ] Click "Next Lesson" button
- [ ] Verify navigation to next lesson works

### 6.4 Test Progress Tracking

**Test Checklist:**
- [ ] Complete 2-3 lessons in a course
- [ ] Navigate back to Library
- [ ] Verify progress bar shows correct percentage
- [ ] Verify "Continue Learning" section appears
- [ ] Click "Continue" on a course
- [ ] Verify it resumes from last accessed lesson

### 6.5 Test Admin Panel

**Test Checklist:**
- [ ] Navigate to Admin tab (web or mobile)
- [ ] Click "Create Course"
- [ ] Fill in:
  - Title: "Test Course"
  - Description: "This is a test"
  - Cover URL: (leave blank or use placeholder)
  - Published: ✓ (checked)
- [ ] Click "Create Course"
- [ ] Verify course appears in admin list
- [ ] Click on the new course
- [ ] Create a module:
  - Title: "Module 1"
  - Order: 1
- [ ] Create a lesson in that module:
  - Title: "Lesson 1"
  - Type: "video"
  - Order: 1
- [ ] Navigate to Library
- [ ] Verify your new course appears

### 6.6 Database Verification

**Via Supabase Dashboard:**

1. **Check user_course_progress:**
   - Go to **Table Editor** → `user_course_progress`
   - Verify rows appear when you view courses
   - Check `last_lesson_id` and `last_accessed_at` update

2. **Check user_lesson_progress:**
   - Go to **Table Editor** → `user_lesson_progress`
   - Verify rows appear when you mark lessons complete
   - Check `is_complete` is `true`
   - Check `completed_at` timestamp is set

3. **Test progress calculation:**
   - Go to **SQL Editor**
   - Run this query (replace with your user ID and course ID):
   ```sql
   SELECT calculate_course_progress(
     'your-user-id'::uuid,
     '550e8400-e29b-41d4-a716-446655440001'::uuid
   );
   ```
   - Verify it returns correct percentage

## Phase 7: Cleanup & Optimization

### 7.1 Remove Mock Data Files (Optional)

Once everything works with real database, you can optionally remove mock data:

```bash
# Move to archive (recommended - keep for reference)
mkdir -p packages/api/src/_archive
mv packages/api/src/mock-data.ts packages/api/src/_archive/

# Or delete completely
rm packages/api/src/mock-data.ts
```

**Note**: Keep mock data if you want to run local development without Supabase.

### 7.2 Update TypeScript Types

Generate fresh types from your database schema:

```bash
# From project root
cd supabase

# Generate types from remote database
yarn generate:remote

# Or if using local Supabase:
yarn generate
```

This creates/updates `/supabase/types.ts` with your exact database schema.

## Phase 8: Commit Changes

### 8.1 Stage Changes

```bash
git add packages/api/src/routers/courses.ts
git add packages/api/src/routers/lessons.ts
git add packages/api/src/routers/progress.ts
```

### 8.2 Commit

```bash
git commit -m "Switch from mock data to real Supabase database

- Set USE_MOCK_DATA = false in all routers
- Tested with seed data
- Verified progress tracking works
- All features functional with real DB

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 8.3 Push to Remote

```bash
git push origin main
```

## Production Deployment

### Web (Next.js on Vercel)

1. **Set Environment Variables in Vercel:**
   - Go to Vercel project settings
   - Navigate to **Environment Variables**
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key`
     - `SUPABASE_SERVICE_ROLE` = `your-service-role-key` (from Supabase → Settings → API)

2. **Deploy:**
   ```bash
   git push origin main  # Auto-deploys if connected
   # Or manually trigger deploy in Vercel dashboard
   ```

3. **Update Supabase Redirect URLs:**
   - Go to Supabase → **Authentication** → **URL Configuration**
   - Add production URL to **Redirect URLs**:
     - `https://your-domain.vercel.app/api/auth/callback`

### Mobile (Expo)

1. **Update `eas.json` environment variables:**
   ```json
   {
     "build": {
       "production": {
         "env": {
           "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
           "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key"
         }
       }
     }
   }
   ```

2. **Build and submit:**
   ```bash
   cd apps/expo
   eas build --platform ios --profile production
   eas build --platform android --profile production
   eas submit --platform ios
   eas submit --platform android
   ```

## Rollback Plan

If something goes wrong, you can quickly rollback:

### Quick Rollback

```bash
# Revert router changes
git checkout HEAD -- packages/api/src/routers/courses.ts
git checkout HEAD -- packages/api/src/routers/lessons.ts
git checkout HEAD -- packages/api/src/routers/progress.ts

# Restart servers
npx expo start --clear
yarn web
```

This reverts to mock data immediately.

### Full Rollback

```bash
# Revert last commit
git revert HEAD
git push origin main
```

## Troubleshooting

### Error: "relation does not exist"

**Cause**: Migration didn't run successfully

**Fix**:
1. Go to Supabase → **SQL Editor**
2. Re-run migration file
3. Check for error messages in red

### Error: "RLS policy violation" or "permission denied"

**Cause**: Row Level Security blocking queries

**Fix**:
1. Verify user is authenticated (check `auth.uid()`)
2. Go to Supabase → **Table Editor** → Select table → **RLS Policies**
3. Verify policies exist:
   - Courses: "Published courses are viewable by everyone"
   - Progress: "Users can view their own..."

### Error: "Cannot read property 'id' of null"

**Cause**: User not authenticated or session expired

**Fix**:
1. Sign out and sign back in
2. Check Supabase → **Authentication** → User exists
3. Verify JWT token is valid (check browser dev tools → Application → Cookies)

### No courses appearing

**Cause**: Seed data not inserted or courses not published

**Fix**:
1. Go to Supabase → **Table Editor** → `courses`
2. Verify 3 rows exist
3. Check `is_published` column = `true`
4. If empty, re-run seed.sql

### Progress not saving

**Cause**: user_course_progress or user_lesson_progress insert failing

**Fix**:
1. Check browser/app console for tRPC errors
2. Verify RLS policies on progress tables
3. Test manually in SQL Editor:
   ```sql
   INSERT INTO user_lesson_progress (user_id, lesson_id, is_complete)
   VALUES (auth.uid(), 'lesson-id-here', true);
   ```

## Post-Deployment Checklist

- [ ] All seed courses appear in Library
- [ ] User can sign up and sign in
- [ ] Lessons load correctly (video/audio/pdf/text stubs)
- [ ] Mark complete functionality works
- [ ] Progress percentages calculate correctly
- [ ] Continue Learning section populates
- [ ] Admin panel creates courses/modules/lessons
- [ ] Database queries are performant (check Supabase logs)
- [ ] No console errors in browser/app
- [ ] RLS policies verified and secure
- [ ] Environment variables set correctly (no localhost in production)

## Next Steps After Deployment

1. **Monitor Performance:**
   - Check Supabase → **Database** → **Query Performance**
   - Add indexes if queries are slow

2. **Set Up Backups:**
   - Supabase auto-backups daily on paid plans
   - Consider exporting data weekly: `supabase db dump -f backup.sql`

3. **Add Analytics:**
   - Track course completion rates
   - Monitor user engagement
   - Add custom events for key actions

4. **Optimize Images:**
   - Use Supabase Storage for course cover images
   - Implement image resizing/CDN

5. **Implement Video Players:**
   - Replace video stubs with actual players
   - Add HLS/DASH streaming support
   - Implement playback position saving

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **tRPC Docs**: https://trpc.io
- **Project Issues**: Create issue in your repo

---

**Document Version**: 1.0
**Last Updated**: 2025-12-23
**Status**: Ready for Deployment
