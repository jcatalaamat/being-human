# Inner Ascend - Complete App Diagnosis

*Generated: December 29, 2025*

## Overview

**Name:** Inner Ascend
**Tagline:** Awaken to your true nature — A 12-month journey of self-discovery, embodied awareness, and inner transformation
**Type:** Multi-tenant course platform with journaling, events, and assignment features
**Platforms:** iOS, Android, Web (cross-platform via Expo + Next.js)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Tamagui (UI), Solito (cross-platform), Expo (native), Next.js (web) |
| **State** | TanStack React Query, Zustand |
| **API** | tRPC (end-to-end typesafe) |
| **Database** | Supabase (PostgreSQL with RLS) |
| **Auth** | Supabase Auth (email/password + Google + Apple OAuth) |
| **Styling** | Tamagui themes with dark/light modes |

---

## Current Features

### User-Facing Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Course Library** | Complete | Browse and enroll in courses |
| **Lesson Player** | Complete | Video, audio, PDF, text, and live lesson types |
| **Progress Tracking** | Complete | Resume position, completion %, last accessed |
| **Drip Content** | Complete | Time-based module unlocks with manual override |
| **Events Calendar** | Complete | Upcoming events with timezone support, meeting/replay URLs |
| **Journaling** | Complete | Personal reflections with staff feedback and comments |
| **Lesson Prompts** | Complete | Assignments with required fields, draft autosave, submission |
| **Multi-Tenant** | Complete | Multiple organizations with tenant switching |
| **Profile & Settings** | Complete | Avatar, email, password management |

### Admin/Staff Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Course Management** | Complete | Create, edit, publish courses with draft workflow |
| **Module Management** | Complete | Sections with drip settings (unlock_after_days) |
| **Lesson Management** | Complete | All content types including live lessons |
| **Event Management** | Complete | Create/edit events with visibility rules |
| **Member Management** | Complete | List members, view progress, manage roles |
| **Journal Inbox** | Complete | Staff review with read receipts, comments, archive/flag |
| **Prompt Response Review** | Complete | View responses, provide feedback, mark reviewed |
| **Activity Logging** | Partial | Database logging exists, no UI yet |

### Content Categories (Lesson Types)

1. **Orientation** - Introduction content
2. **Transmission** - Core teaching content
3. **Clarification** - Q&A and explanations
4. **Embodiment** - Practice exercises
5. **Inquiry** - Self-reflection prompts
6. **Meditation** - Guided meditations
7. **Assignment** - Homework/exercises

---

## Monorepo Structure

```
being-human/
├── apps/
│   ├── expo/                 # React Native mobile app
│   ├── next/                 # Next.js web app
│   ├── storybook/            # Web component library
│   └── storybook-rn/         # Native component library
├── packages/
│   ├── app/                  # Shared screens & business logic
│   │   ├── features/         # Feature modules
│   │   │   ├── admin/        # Admin screens
│   │   │   ├── auth/         # Authentication
│   │   │   ├── course/       # Course detail
│   │   │   ├── events/       # Events calendar
│   │   │   ├── journal/      # Journaling
│   │   │   ├── lesson/       # Lesson player
│   │   │   ├── library/      # Home/dashboard
│   │   │   ├── profile/      # User profile
│   │   │   └── settings/     # Settings
│   │   ├── provider/         # Context providers
│   │   └── utils/            # Shared utilities
│   ├── api/                  # tRPC API layer
│   │   └── src/routers/      # API endpoints
│   └── ui/                   # Tamagui component library
├── supabase/                 # Database migrations
└── docs/                     # Documentation
```

---

## Database Schema Summary

### Core Tables

| Category | Tables |
|----------|--------|
| **Multi-tenancy** | `tenants`, `tenant_memberships`, `tenant_invitations` |
| **Content** | `courses`, `modules`, `lessons` |
| **Progress** | `user_course_progress`, `user_lesson_progress`, `user_module_unlocks` |
| **Events** | `events` |
| **Journaling** | `journal_entries`, `journal_comments`, `journal_read_receipts` |
| **Assignments** | `lesson_prompts`, `prompt_responses`, `prompt_feedback` |
| **System** | `profiles`, `activity_log` |

### Role Hierarchy

1. **Owner** - Full tenant control
2. **Admin** - Member and content management
3. **Instructor** - Content creation only
4. **Member** - View content only

---

## API Endpoints (tRPC Routers)

| Router | Purpose |
|--------|---------|
| `courses` | List, get, enroll, continue learning |
| `lessons` | Get lesson, navigate next/prev |
| `progress` | Update playback, mark complete |
| `events` | List upcoming, create, update, delete |
| `journal` | CRUD entries, comments, staff inbox |
| `prompts` | Get/submit responses, staff feedback |
| `admin` | Course/module/lesson CRUD |
| `members` | List members, progress tracking |
| `tenants` | Tenant management, invitations |
| `user` | Profile, account deletion |

---

## Architecture Strengths

1. **Cross-platform code sharing** - ~95% shared between web and native
2. **Type safety** - End-to-end types from DB to UI via tRPC + Zod
3. **Row Level Security** - Database-enforced tenant isolation
4. **Progressive content** - Drip unlock system is flexible
5. **Offline support foundation** - AsyncStorage and caching ready
6. **Clean feature organization** - Each feature is self-contained

---

## Current Gaps / Technical Debt

| Area | Issue | Priority |
|------|-------|----------|
| **Background Jobs** | No worker system for async tasks (emails, notifications) | High |
| **Push Notifications** | Expo push tokens stored but not used | High |
| **Search** | No full-text search for courses, lessons, journals | Medium |
| **Real-time** | No Supabase subscriptions (live updates) | Medium |
| **Activity Log UI** | Data exists but no admin interface | Low |
| **Batch Operations** | No bulk member/content actions | Low |
| **Analytics** | No usage tracking or dashboards | Medium |

---

## Potential Directions

### 1. Engagement & Retention

| Feature | Description | Effort |
|---------|-------------|--------|
| **Push Notifications** | Event reminders, new content alerts, prompt due dates | Medium |
| **Email Digests** | Weekly progress summaries, staff journal updates | Medium |
| **Streaks & Badges** | Daily login streaks, completion achievements | Medium |
| **Community Feed** | Cohort visibility for journal entries, peer support | Large |
| **In-App Messaging** | Direct messages between members and staff | Large |

### 2. Content Enhancement

| Feature | Description | Effort |
|---------|-------------|--------|
| **Bookmarks/Favorites** | Save lessons for quick access | Small |
| **Notes** | Personal notes attached to lessons | Small |
| **Transcripts** | AI-generated transcripts for video/audio | Medium |
| **Search** | Full-text search across all content | Medium |
| **Content Recommendations** | "Based on your progress" suggestions | Medium |
| **Offline Downloads** | Download lessons for offline viewing | Large |

### 3. Admin & Operations

| Feature | Description | Effort |
|---------|-------------|--------|
| **Analytics Dashboard** | Course completion rates, engagement metrics | Medium |
| **Bulk Actions** | Mass unlock, mass enroll, bulk email | Medium |
| **Activity Log UI** | View audit trail in admin panel | Small |
| **Automated Emails** | Welcome sequences, drip reminders | Medium |
| **Cohort Management** | Group members for paced learning | Medium |
| **Revenue/Payments** | Stripe integration for paid courses | Large |

### 4. Learning Experience

| Feature | Description | Effort |
|---------|-------------|--------|
| **Quizzes** | Knowledge check after lessons | Medium |
| **Certificates** | PDF certificates on course completion | Small |
| **Learning Paths** | Multi-course sequences | Medium |
| **Calendar Integration** | Add events to Google/Apple calendar | Small |
| **Live Session Chat** | Real-time chat during live lessons | Medium |
| **Cohort Schedules** | Fixed start dates with paced content | Medium |

### 5. Platform & Scale

| Feature | Description | Effort |
|---------|-------------|--------|
| **Background Workers** | Inngest or similar for async jobs | Medium |
| **Real-time Subscriptions** | Supabase realtime for live updates | Medium |
| **CDN for Media** | Video hosting optimization (Mux, Cloudflare Stream) | Medium |
| **Mobile App Store Release** | Production iOS/Android builds | Medium |
| **White-label Support** | Theming per tenant | Large |

---

## Recommended Roadmap

### Phase 1: Foundation (Immediate)
1. **Push Notifications** - Critical for engagement
2. **Background Jobs** - Required for notifications and emails
3. **Activity Log UI** - Visibility into system usage

### Phase 2: Engagement (Short-term)
4. **Streaks/Progress Badges** - Motivation mechanics
5. **Email Notifications** - Event reminders, new content alerts
6. **Bookmarks & Notes** - Personal learning tools

### Phase 3: Scale (Medium-term)
7. **Analytics Dashboard** - Understand usage patterns
8. **Search** - Content discovery at scale
9. **Offline Downloads** - Native app differentiation

### Phase 4: Monetization (Long-term)
10. **Payments Integration** - Stripe for paid courses
11. **Cohort Management** - Premium group experiences
12. **Certificates** - Completion credentials

---

## Summary

Inner Ascend is a well-architected, production-ready course platform with a solid foundation. The core learning experience (courses, lessons, progress, drip content) is complete and polished. Engagement features (journals, prompts, events) provide good interactivity.

| Aspect | Assessment |
|--------|------------|
| **Key strengths** | Cross-platform, type-safe, multi-tenant, clean architecture |
| **Key gaps** | Push notifications, background jobs, analytics |
| **Biggest opportunity** | Engagement mechanics (notifications, streaks, community) |

The platform is ready for production use and has clear paths for enhancement based on user needs and business goals.
