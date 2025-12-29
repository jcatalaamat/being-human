import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { MOCK_COURSES, MOCK_MODULES } from '../mock-data'
import { createTRPCRouter, tenantProcedure } from '../trpc'

// Set to true to use mock data, false to use real database
const USE_MOCK_DATA = false

export const coursesRouter = createTRPCRouter({
  // Get all live/scheduled courses with user progress (scoped to current tenant)
  list: tenantProcedure.query(async ({ ctx }) => {
    if (USE_MOCK_DATA) {
      return MOCK_COURSES
    }

    // Members see live and scheduled courses (not drafts)
    const { data: courses, error } = await ctx.supabase
      .from('courses')
      .select('*')
      .eq('tenant_id', ctx.tenant.tenantId)
      .in('status', ['live', 'scheduled'])
      .order('created_at', { ascending: false })

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    // For each course, calculate progress and get last accessed info
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        // Get user's progress for this course
        const { data: progressData } = await ctx.supabase
          .from('user_course_progress')
          .select('last_lesson_id, last_accessed_at')
          .eq('user_id', ctx.user.id)
          .eq('course_id', course.id)
          .single()

        // Calculate progress percentage
        const { data: progressPct } = await ctx.supabase.rpc('calculate_course_progress', {
          p_user_id: ctx.user.id,
          p_course_id: course.id,
        })

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          coverUrl: course.cover_url,
          progressPct: progressPct || 0,
          lastLessonId: progressData?.last_lesson_id || null,
          lastAccessedAt: progressData?.last_accessed_at || null,
        }
      })
    )

    return coursesWithProgress
  }),

  // Get single course details (must belong to current tenant)
  getById: tenantProcedure.input(z.object({ courseId: z.string().uuid() })).query(async ({ ctx, input }) => {
    if (USE_MOCK_DATA) {
      const course = MOCK_COURSES.find((c) => c.id === input.courseId)
      if (!course) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' })
      }
      return course
    }

    const { data, error } = await ctx.supabase
      .from('courses')
      .select('*')
      .eq('id', input.courseId)
      .eq('tenant_id', ctx.tenant.tenantId)
      .single()

    if (error) {
      throw new TRPCError({ code: 'NOT_FOUND', message: error.message })
    }

    // Get progress percentage
    const { data: progressPct } = await ctx.supabase.rpc('calculate_course_progress', {
      p_user_id: ctx.user.id,
      p_course_id: input.courseId,
    })

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      coverUrl: data.cover_url,
      promoVideoUrl: data.promo_video_url,
      isPublished: data.is_published,
      status: data.status as 'draft' | 'scheduled' | 'live',
      releaseAt: data.release_at,
      progressPct: progressPct || 0,
    }
  }),

  // Get course modules with lessons and progress (includes lock status)
  getModulesWithLessons: tenantProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      if (USE_MOCK_DATA) {
        const modules = MOCK_MODULES[input.courseId as keyof typeof MOCK_MODULES] || []
        return modules
      }

      // Verify course belongs to current tenant and get release info
      const { data: course } = await ctx.supabase
        .from('courses')
        .select('tenant_id, status, release_at')
        .eq('id', input.courseId)
        .single()

      if (!course || course.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' })
      }

      // Get user's enrollment for this course (must be active)
      const { data: enrollment } = await ctx.supabase
        .from('user_course_progress')
        .select('enrolled_at, started_at, status')
        .eq('user_id', ctx.user.id)
        .eq('course_id', input.courseId)
        .eq('status', 'active')
        .single()

      const isEnrolled = !!enrollment
      const enrolledAt = enrollment ? new Date(enrollment.enrolled_at || enrollment.started_at) : null

      // Calculate effective start: later of course release or enrollment
      const courseReleaseAt = course.release_at ? new Date(course.release_at) : null
      const effectiveStart =
        enrolledAt && courseReleaseAt
          ? new Date(Math.max(enrolledAt.getTime(), courseReleaseAt.getTime()))
          : enrolledAt

      // Get published modules only (admins/instructors see all via admin routes)
      const { data: modules, error } = await ctx.supabase
        .from('modules')
        .select('*')
        .eq('course_id', input.courseId)
        .eq('is_published', true)
        .order('order_index', { ascending: true })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // For each module, get its lessons with progress and lock status
      const modulesWithLessons = await Promise.all(
        modules.map(async (module) => {
          // Calculate lock status
          let isLocked = true
          let unlockDate: Date | null = null

          if (isEnrolled && effectiveStart) {
            // Check for manual unlock
            const { data: manualUnlock } = await ctx.supabase
              .from('user_module_unlocks')
              .select('unlocked_at')
              .eq('user_id', ctx.user.id)
              .eq('module_id', module.id)
              .single()

            if (manualUnlock) {
              isLocked = false
            } else {
              // Check module-level release override
              const moduleReleaseAt = module.release_at ? new Date(module.release_at) : null
              if (moduleReleaseAt && new Date() < moduleReleaseAt) {
                isLocked = true
                unlockDate = moduleReleaseAt
              } else {
                // Calculate time-based unlock from effective start (cohort-aware)
                unlockDate = new Date(effectiveStart)
                unlockDate.setDate(unlockDate.getDate() + (module.unlock_after_days || 0))
                isLocked = new Date() < unlockDate
              }
            }
          }

          // Get published lessons only
          const { data: lessons, error: lessonsError } = await ctx.supabase
            .from('lessons')
            .select('*')
            .eq('module_id', module.id)
            .eq('is_published', true)
            .order('order_index', { ascending: true })

          if (lessonsError) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: lessonsError.message })
          }

          // Get progress for each lesson
          const lessonsWithProgress = await Promise.all(
            lessons.map(async (lesson) => {
              const { data: progress } = await ctx.supabase
                .from('user_lesson_progress')
                .select('is_complete, last_position_sec')
                .eq('user_id', ctx.user.id)
                .eq('lesson_id', lesson.id)
                .single()

              const isComplete = progress?.is_complete || false

              return {
                id: lesson.id,
                moduleId: lesson.module_id,
                title: lesson.title,
                description: lesson.description,
                type: lesson.lesson_type as 'video' | 'audio' | 'pdf' | 'text',
                durationSec: lesson.duration_sec,
                contentUrl: lesson.content_url,
                contentText: lesson.content_text,
                orderIndex: lesson.order_index,
                isComplete,
                lastPositionSec: progress?.last_position_sec || 0,
              }
            })
          )

          // Check if any lesson in this module is completed (completion overrides lock)
          const hasCompletedLesson = lessonsWithProgress.some((l) => l.isComplete)

          return {
            id: module.id,
            courseId: module.course_id,
            title: module.title,
            description: module.description,
            orderIndex: module.order_index,
            // Completion overrides lock - if user completed any lesson, module stays accessible
            isLocked: hasCompletedLesson ? false : isLocked,
            unlockDate: unlockDate?.toISOString() || null,
            lessons: lessonsWithProgress,
          }
        })
      )

      return modulesWithLessons
    }),

  // Enroll in a course (create initial progress record) - must be tenant member
  enroll: tenantProcedure.input(z.object({ courseId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    if (USE_MOCK_DATA) {
      return { success: true }
    }

    // Verify course belongs to current tenant
    const { data: course } = await ctx.supabase
      .from('courses')
      .select('tenant_id')
      .eq('id', input.courseId)
      .single()

    if (!course || course.tenant_id !== ctx.tenant.tenantId) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' })
    }

    const now = new Date().toISOString()
    const { error } = await ctx.supabase
      .from('user_course_progress')
      .upsert(
        {
          user_id: ctx.user.id,
          course_id: input.courseId,
          started_at: now,
          enrolled_at: now,
        },
        {
          onConflict: 'user_id,course_id',
        }
      )
      .select()
      .single()

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    return { success: true }
  }),

  // Get continue learning courses (recently accessed, scoped to tenant)
  getContinueLearning: tenantProcedure.query(async ({ ctx }) => {
    if (USE_MOCK_DATA) {
      // Return courses that have progress
      const continueCourses = MOCK_COURSES.filter((c) => c.progressPct > 0 && c.lastAccessedAt).map((c) => {
        // Find the lesson title
        const modules = MOCK_MODULES[c.id as keyof typeof MOCK_MODULES] || []
        let lastLessonTitle = null
        for (const module of modules) {
          const lesson = module.lessons.find((l) => l.id === c.lastLessonId)
          if (lesson) {
            lastLessonTitle = lesson.title
            break
          }
        }

        return {
          ...c,
          lastLessonTitle,
        }
      })

      return continueCourses
    }

    // Get progress records only for courses in the current tenant
    const { data: progressRecords, error } = await ctx.supabase
      .from('user_course_progress')
      .select('course_id, last_lesson_id, last_accessed_at, courses!inner(tenant_id)')
      .eq('user_id', ctx.user.id)
      .eq('courses.tenant_id', ctx.tenant.tenantId)
      .not('last_accessed_at', 'is', null)
      .order('last_accessed_at', { ascending: false })
      .limit(3)

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    // For each progress record, get the course details (already filtered by tenant in query above)
    const coursesWithProgress = await Promise.all(
      progressRecords.map(async (record) => {
        const { data: course } = await ctx.supabase
          .from('courses')
          .select('*')
          .eq('id', record.course_id)
          .eq('tenant_id', ctx.tenant.tenantId)
          .single()

        if (!course) return null

        // Calculate progress percentage
        const { data: progressPct } = await ctx.supabase.rpc('calculate_course_progress', {
          p_user_id: ctx.user.id,
          p_course_id: record.course_id,
        })

        // Get the last lesson details
        let lastLessonTitle = null
        if (record.last_lesson_id) {
          const { data: lesson } = await ctx.supabase
            .from('lessons')
            .select('title')
            .eq('id', record.last_lesson_id)
            .single()

          lastLessonTitle = lesson?.title || null
        }

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          coverUrl: course.cover_url,
          progressPct: progressPct || 0,
          lastLessonId: record.last_lesson_id,
          lastLessonTitle,
          lastAccessedAt: record.last_accessed_at,
        }
      })
    )

    // Filter out nulls
    return coursesWithProgress.filter((c) => c !== null)
  }),
})
