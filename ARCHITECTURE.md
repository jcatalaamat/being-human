# Inner Ascend - Architecture Guide

A multi-tenant course platform built on Tamagui Takeout.

## Features

### Multi-Tenancy
- Organizations (tenants) with isolated content
- Role-based access: owner, admin, instructor, member
- Users only see courses from their tenant
- Tenant switching for users with multiple memberships

### Course Management
- Courses with modules and lessons
- Lesson types: video, audio, PDF, text
- Cover images and promo videos
- Release state workflow: draft → scheduled → live

### Drip Content (Cohort-Ready)
- Modules unlock X days after **effective start**
- Effective start = max(course.release_at, enrolled_at)
- Manual unlock override by admins
- Per-user unlock tracking
- Completion overrides lock (completed lessons stay accessible)

### Enrollment Management
- Enrollment status: active / revoked
- Access revocation by admins
- Auto-enrollment on tenant join (published courses)

### User Progress
- Lesson completion tracking
- Resume position for video/audio
- Course progress percentage
- "Continue Learning" section

### Member Management (Admin)
- View enrolled members per course
- Track individual progress
- Manual module unlocks

---

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (name, avatar) |
| `courses` | Course content with `tenant_id`, `status` (draft/scheduled/live), `release_at` |
| `modules` | Course sections with `unlock_after_days`, `release_at` override |
| `lessons` | Individual lessons (video/audio/pdf/text), `is_published` |

### Progress Tables

| Table | Description |
|-------|-------------|
| `user_course_progress` | Enrollment with `status` (active/revoked), `enrolled_at` |
| `user_lesson_progress` | Completion status, playback position |
| `user_module_unlocks` | Manual admin overrides for drip |
| `activity_log` | Audit trail for enrollments, completions, membership changes |

### Multi-Tenancy Tables

| Table | Description |
|-------|-------------|
| `tenants` | Organizations (name, slug, logo, settings) |
| `tenant_memberships` | User-tenant with role (owner/admin/instructor/member) |
| `tenant_invitations` | Pending invitations with token |

---

## API Routes (tRPC)

### `api.courses.*`
| Procedure | Auth | Description |
|-----------|------|-------------|
| `list` | tenant | Get tenant's published courses |
| `getById` | tenant | Single course details |
| `getModulesWithLessons` | tenant | Full structure with lock status |
| `enroll` | tenant | Create enrollment |
| `getContinueLearning` | tenant | Recently accessed courses |

### `api.admin.*`
| Procedure | Auth | Description |
|-----------|------|-------------|
| `createCourse` | content | Create course in tenant |
| `updateCourse` | content | Update course |
| `deleteCourse` | admin | Delete course |
| `createModule` | content | Add module to course |
| `updateModule` | content | Update module |
| `deleteModule` | content | Delete module |
| `createLesson` | content | Add lesson to module |
| `updateLesson` | content | Update lesson |
| `deleteLesson` | content | Delete lesson |
| `reorderModule` | content | Change module order |
| `reorderLesson` | content | Change lesson order |

### `api.members.*`
| Procedure | Auth | Description |
|-----------|------|-------------|
| `listByCourse` | admin | Members enrolled in course |
| `listAll` | admin | All tenant members (active only) |
| `getMemberProgress` | admin | Detailed progress per user |
| `unlockModule` | admin | Manual drip override |
| `revokeUnlock` | admin | Remove manual unlock |
| `revokeEnrollment` | admin | Revoke user's course access |
| `restoreEnrollment` | admin | Restore revoked access |

### `api.tenants.*`
| Procedure | Auth | Description |
|-----------|------|-------------|
| `create` | protected | Create tenant (become owner) |
| `listMine` | protected | User's tenants with roles |
| `getCurrent` | tenant | Current tenant details |
| `update` | admin | Update tenant settings |
| `listMembers` | admin | All tenant members |
| `addMember` | admin | Add user to tenant |
| `updateMemberRole` | admin | Change member role |
| `removeMember` | admin | Remove from tenant |
| `listInvitations` | admin | Pending invites |
| `createInvitation` | admin | Send invite |
| `deleteInvitation` | admin | Cancel invite |
| `acceptInvitation` | protected | Join via token |

**Auth levels:**
- `protected` = logged in user
- `tenant` = tenant member (any role)
- `content` = owner, admin, or instructor
- `admin` = owner or admin only

---

## Role Permissions

| Action | Owner | Admin | Instructor | Member |
|--------|:-----:|:-----:|:----------:|:------:|
| Update tenant settings | Yes | Yes | - | - |
| Manage members | Yes | Yes | - | - |
| Create/edit courses | Yes | Yes | Yes | - |
| Delete courses | Yes | Yes | - | - |
| Unlock modules | Yes | Yes | - | - |
| View courses | Yes | Yes | Yes | Yes |
| Enroll in courses | Yes | Yes | Yes | Yes |

---

## Key Files

### API Layer
```
packages/api/src/
├── trpc.ts              # Context, auth, tenant middleware
└── routers/
    ├── _app.ts          # Router registration
    ├── admin.ts         # Course/module/lesson CRUD
    ├── courses.ts       # Course listing, enrollment
    ├── members.ts       # Member management
    ├── tenants.ts       # Tenant management
    ├── lessons.ts       # Lesson progress
    └── user.ts          # Profile, account deletion
```

### Frontend
```
packages/app/
├── provider/
│   ├── tenant/          # TenantProvider, useTenant hook
│   └── index.tsx        # All providers composed
├── utils/
│   └── api.ts           # tRPC client with x-tenant-slug header
└── features/
    ├── home/            # Course list, continue learning
    ├── course/          # Course detail, lesson player
    ├── admin/           # Admin screens
    └── settings/        # User settings
```

### Database
```
supabase/migrations/
├── 20251227000000_add_drip_content.sql     # Drip content tables
├── 20251227100000_add_deletion_requested.sql
├── 20251228000000_add_multi_tenancy.sql    # Multi-tenant schema
├── 20251228100000_auto_enroll_on_join.sql  # Auto-enrollment triggers
├── 20251228200000_mvp_hardening.sql        # Status, activity logging
└── 20251228300000_release_state.sql        # draft/scheduled/live status
```

---

## How Tenant Context Works

1. **Frontend**: `TenantProvider` fetches user's tenants via `api.tenants.listMine`
2. **Selection**: First tenant auto-selected, stored in localStorage
3. **Header**: All API calls include `x-tenant-slug` header
4. **Backend**: `createTRPCContext` extracts slug, looks up membership
5. **Middleware**: `tenantProcedure` enforces tenant context exists
6. **RLS**: PostgreSQL policies also enforce tenant isolation

```
User Request
    ↓
x-tenant-slug: "holistic-training"
    ↓
tRPC Context → tenant_memberships lookup
    ↓
ctx.tenant = { tenantId, tenantSlug, role }
    ↓
tenantProcedure middleware validates
    ↓
Query executes with tenant filter
    ↓
RLS policies double-check access
```

---

## Quick Commands

```bash
# Development
yarn web              # Start Next.js
yarn native           # Start Expo

# Database
npx supabase db push  # Push migrations
npx supabase gen types typescript --linked > packages/supabase/types/index.ts

# Code generation
yarn gen component    # New component
yarn gen screen       # New screen
yarn gen router       # New tRPC router
```
