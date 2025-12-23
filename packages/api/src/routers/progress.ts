import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

// Set to true to use mock data, false to use real database
const USE_MOCK_DATA = true

export const progressRouter = createTRPCRouter({
  // Mark lesson as complete
  markLessonComplete: protectedProcedure
    .input(
      z.object({
        lessonId: z.string().uuid(),
        courseId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (USE_MOCK_DATA) {
        // In mock mode, just return success (no persistence)
        console.log('Mock: Marking lesson complete', input.lessonId)
        return { success: true }
      }

      // Upsert lesson progress
      const { error: lessonError } = await ctx.supabase.from('user_lesson_progress').upsert(
        {
          user_id: ctx.user.id,
          lesson_id: input.lessonId,
          is_complete: true,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,lesson_id',
        }
      )

      if (lessonError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: lessonError.message })
      }

      // Update course progress (last accessed + last lesson)
      const { error: courseError } = await ctx.supabase.from('user_course_progress').upsert(
        {
          user_id: ctx.user.id,
          course_id: input.courseId,
          last_lesson_id: input.lessonId,
          last_accessed_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,course_id',
        }
      )

      if (courseError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: courseError.message })
      }

      return { success: true }
    }),

  // Mark lesson as incomplete
  markLessonIncomplete: protectedProcedure
    .input(
      z.object({
        lessonId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (USE_MOCK_DATA) {
        console.log('Mock: Marking lesson incomplete', input.lessonId)
        return { success: true }
      }

      const { error } = await ctx.supabase.from('user_lesson_progress').upsert(
        {
          user_id: ctx.user.id,
          lesson_id: input.lessonId,
          is_complete: false,
          completed_at: null,
        },
        {
          onConflict: 'user_id,lesson_id',
        }
      )

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Update video/audio playback position
  updatePlaybackPosition: protectedProcedure
    .input(
      z.object({
        lessonId: z.string().uuid(),
        courseId: z.string().uuid(),
        positionSec: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (USE_MOCK_DATA) {
        console.log('Mock: Updating playback position', input.lessonId, input.positionSec)
        return { success: true }
      }

      const { error } = await ctx.supabase.from('user_lesson_progress').upsert(
        {
          user_id: ctx.user.id,
          lesson_id: input.lessonId,
          last_position_sec: input.positionSec,
        },
        {
          onConflict: 'user_id,lesson_id',
        }
      )

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Also update course last accessed
      await ctx.supabase.from('user_course_progress').upsert(
        {
          user_id: ctx.user.id,
          course_id: input.courseId,
          last_lesson_id: input.lessonId,
          last_accessed_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,course_id',
        }
      )

      return { success: true }
    }),

  // Get user's overall stats
  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    if (USE_MOCK_DATA) {
      // Return mock stats
      return {
        enrolledCourses: 3,
        completedLessons: 5,
      }
    }

    // Count enrolled courses
    const { count: enrolledCount, error: enrolledError } = await ctx.supabase
      .from('user_course_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', ctx.user.id)

    if (enrolledError) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: enrolledError.message })
    }

    // Count completed lessons
    const { count: completedLessons, error: completedError } = await ctx.supabase
      .from('user_lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', ctx.user.id)
      .eq('is_complete', true)

    if (completedError) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: completedError.message })
    }

    return {
      enrolledCourses: enrolledCount || 0,
      completedLessons: completedLessons || 0,
    }
  }),

  // Get progress for a specific course
  getCourseProgress: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      if (USE_MOCK_DATA) {
        // Find mock course and return progress data
        const { MOCK_COURSES, MOCK_MODULES } = await import('../mock-data')
        const course = MOCK_COURSES.find((c) => c.id === input.courseId)

        return {
          progressPct: course?.progressPct || 0,
          lastAccessedAt: course?.lastAccessedAt || null,
          lastLessonId: course?.lastLessonId || null,
          completedLessons: 2,
        }
      }

      const { data: progressPct } = await ctx.supabase.rpc('calculate_course_progress', {
        p_user_id: ctx.user.id,
        p_course_id: input.courseId,
      })

      // Get course progress record
      const { data: courseProgress } = await ctx.supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', ctx.user.id)
        .eq('course_id', input.courseId)
        .single()

      // Count total and completed lessons
      const { data: totalLessons } = await ctx.supabase
        .from('lessons')
        .select(
          `
        id,
        modules!inner(course_id)
      `,
          { count: 'exact', head: true }
        )
        .eq('modules.course_id', input.courseId)

      const { count: completedCount } = await ctx.supabase
        .from('user_lesson_progress')
        .select(
          `
        *,
        lessons!inner(
          modules!inner(course_id)
        )
      `,
          { count: 'exact', head: true }
        )
        .eq('user_id', ctx.user.id)
        .eq('is_complete', true)
        .eq('lessons.modules.course_id', input.courseId)

      return {
        progressPct: progressPct || 0,
        lastAccessedAt: courseProgress?.last_accessed_at || null,
        lastLessonId: courseProgress?.last_lesson_id || null,
        completedLessons: completedCount || 0,
      }
    }),
})
