# Testing Checklist - Egon Courses Platform

## Database Status ✅

- **Connected to**: https://vpdwubpodcrbicvldskg.supabase.co
- **Tables created**: courses, modules, lessons, user_course_progress, user_lesson_progress
- **Seed data**: 3 courses, 5 modules, 5 lessons (confirmed via test script)
- **Mock data**: DISABLED (`USE_MOCK_DATA = false` in all routers)

## What to Test

### 1. Library Screen (Main Page)

**Expected behavior:**
- [ ] Shows "My Library" header
- [ ] Shows 3 courses: Introduction to React, Advanced TypeScript, React Native Fundamentals
- [ ] Each course shows cover image from picsum.photos
- [ ] Progress bar shows 0% for new users
- [ ] No "Continue Learning" section (user hasn't started any courses yet)

**Empty state:**
- [ ] If no courses: Shows "No courses yet" + "Egon will add content soon"

**Test:**
```
1. Navigate to http://localhost:3000 (web) or Library tab (mobile)
2. Verify courses appear
3. Click on a course card
```

### 2. Course Detail Screen

**Test course**: Introduction to React (`550e8400-e29b-41d4-a716-446655440001`)

**Expected behavior:**
- [ ] Shows course title: "Introduction to React"
- [ ] Shows description
- [ ] Shows cover image
- [ ] Shows "Start Course" button (not "Resume" since progress is 0%)
- [ ] Shows 3 modules:
  - Getting Started
  - Components and Props
  - State and Hooks
- [ ] Each module is expandable (accordion)
- [ ] Module 1 should show 3 lessons when expanded

**Empty state:**
- [ ] If course has no modules: Shows "No lessons yet" message

**Test:**
```
1. Click "Introduction to React" from Library
2. Verify all modules appear
3. Click on "Getting Started" module to expand
4. Verify 3 lessons appear
5. Click on "Welcome to React" lesson
```

### 3. Lesson Screen

**Test lesson**: Welcome to React (`750e8400-e29b-41d4-a716-446655440001`)

**Expected behavior:**
- [ ] Shows lesson title: "Welcome to React"
- [ ] Shows description: "Introduction video to the course"
- [ ] Shows video player (stub) with sample video URL
- [ ] Shows "Mark Complete" button at bottom
- [ ] Shows "Next Lesson" button
- [ ] Video URL: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`

**Actions to test:**
- [ ] Click "Mark Complete" - should update progress
- [ ] Click "Next Lesson" - should navigate to "Setting Up Your Environment"
- [ ] Navigate back and verify lesson is marked complete (checkmark icon)

**Test:**
```
1. From Course Detail, click "Welcome to React"
2. Verify lesson loads
3. Click "Mark Complete"
4. Click "Next Lesson"
5. Verify navigation to next lesson
```

### 4. Admin Panel

**Location:**
- Web: http://localhost:3000/admin
- Mobile: Admin tab

**Expected behavior:**
- [ ] Shows "Manage Courses" header
- [ ] Shows "Create Course" button
- [ ] Lists all 3 seeded courses
- [ ] Each course has Edit and Delete buttons

**Empty state:**
- [ ] If no courses: Shows "No courses yet" + "Create your first course to get started"

**Create course test:**
- [ ] Click "Create Course"
- [ ] Fill in title, description
- [ ] Check "Published"
- [ ] Submit
- [ ] Verify new course appears in admin list
- [ ] Verify new course appears in Library

**Test:**
```
1. Navigate to /admin (web) or Admin tab (mobile)
2. Verify 3 courses appear
3. Click "Create Course"
4. Fill form and submit
5. Verify success
```

### 5. Progress Tracking

**Test flow:**
1. [ ] Start "Introduction to React" course
2. [ ] Complete first lesson "Welcome to React"
3. [ ] Navigate back to Library
4. [ ] Verify course shows progress > 0%
5. [ ] Verify "Continue Learning" section appears
6. [ ] Click "Continue" on the course
7. [ ] Verify it resumes from last lesson

**Database verification:**
```sql
-- Check course progress
SELECT * FROM user_course_progress;

-- Check lesson progress
SELECT * FROM user_lesson_progress;
```

### 6. Settings Screen

**Location:**
- Web: http://localhost:3000/settings
- Mobile: Settings tab

**Expected behavior:**
- [ ] Shows settings menu
- [ ] Profile link works
- [ ] Change password link works
- [ ] Change email link works
- [ ] Theme toggle works (light/dark)
- [ ] Logout button works

**Test:**
```
1. Navigate to Settings
2. Click Profile
3. Verify can edit name
4. Toggle theme
5. Verify UI changes color
```

## Known Issues to Fix

### Critical (App Breaking)

- [ ] **RPC Function Errors**: If `calculate_course_progress` RPC fails, the whole query fails
  - Fix: Add try-catch around RPC call
  - Fallback to 0% if RPC fails

- [ ] **Missing Null Checks**: Some screens might crash if data is null
  - Fix: Add `?.` optional chaining everywhere
  - Add proper loading states

- [ ] **Error Boundaries**: No error boundaries on screens
  - Fix: Wrap main screens in error boundary components

### Medium Priority

- [ ] **Loading Skeletons**: Some screens just show "Loading..." text
  - Fix: Add proper skeleton components

- [ ] **Empty States**: Not all screens have empty states
  - Fix: Add EmptyState component to all list views

- [ ] **Error States**: No retry functionality on errors
  - Fix: Add ErrorState with retry button everywhere

### Low Priority

- [ ] **Image Loading**: No loading states for course cover images
- [ ] **Video Player**: Using stub, need real video player component
- [ ] **PDF Viewer**: Using stub, need real PDF viewer

## Error Scenarios to Test

### No Internet Connection
- [ ] App shows appropriate error message
- [ ] Retry button works when connection restored

### Invalid Course ID
- [ ] Shows 404 or "Course not found" error
- [ ] Back button works

### Database Query Fails
- [ ] Shows error message with retry
- [ ] Doesn't crash the app

### User Not Authenticated
- [ ] Redirects to sign-in
- [ ] Returns to intended page after sign-in

## Performance Tests

- [ ] Library loads in < 2 seconds
- [ ] Course detail loads in < 1 second
- [ ] Lesson navigation is instant
- [ ] Progress updates reflect immediately

## Browser/Platform Tests

### Web
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)

### Mobile
- [ ] iOS Simulator
- [ ] Android Emulator
- [ ] Physical device (if available)

## Debugging Commands

### Test Database Connection
```bash
npx tsx scripts/test-supabase-connection.ts
```

### Check Environment Variables
```bash
# Should show your Supabase URL
echo $NEXT_PUBLIC_SUPABASE_URL

# Should show anon key (first 20 chars)
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY | cut -c1-20
```

### Restart Dev Servers
```bash
# Clear Expo cache and restart
cd apps/expo && npx expo start --clear

# Restart Next.js (in separate terminal)
cd apps/next && yarn dev
```

### Check Logs
```bash
# Web: Open browser console (F12)
# Mobile: Check terminal running expo

# Look for:
# - tRPC errors
# - Supabase query errors
# - React errors
```

## Next Steps After Testing

1. [ ] Fix any breaking issues found during testing
2. [ ] Add error boundaries to all screens
3. [ ] Improve loading states (skeletons instead of text)
4. [ ] Add retry functionality to error states
5. [ ] Test with multiple users
6. [ ] Test progress calculation with partial completion
7. [ ] Deploy to staging environment
8. [ ] Run full E2E test suite

## Success Criteria

✅ All critical user flows work:
- View courses
- Start a course
- Complete lessons
- Track progress
- Create new courses (admin)

✅ No crashes or breaking errors
✅ Empty states display correctly
✅ Error states are helpful and recoverable
✅ Performance is acceptable (< 2s loads)
