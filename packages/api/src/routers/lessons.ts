import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { MOCK_MODULES } from '../mock-data'
import { createTRPCRouter, protectedProcedure } from '../trpc'

// Set to true to use mock data, false to use real database
const USE_MOCK_DATA = false

export const lessonsRouter = createTRPCRouter({
  // Get lesson by ID with progress
  getById: protectedProcedure.input(z.object({ lessonId: z.string().uuid() })).query(async ({ ctx, input }) => {
    if (USE_MOCK_DATA) {
      // Find lesson in mock data
      for (const [courseId, modules] of Object.entries(MOCK_MODULES)) {
        for (const module of modules) {
          const lesson = module.lessons.find((l) => l.id === input.lessonId)
          if (lesson) {
            return {
              id: lesson.id,
              moduleId: module.id,
              title: lesson.title,
              description: lesson.description,
              type: lesson.type,
              durationSec: lesson.durationSec,
              contentUrl: lesson.contentUrl,
              contentText: lesson.contentText,
              module: {
                id: module.id,
                title: module.title,
                courseId: module.courseId,
              },
              isComplete: lesson.isComplete || false,
              lastPositionSec: lesson.lastPositionSec || 0,
            }
          }
        }
      }
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Lesson not found' })
    }

    const { data: lesson, error } = await ctx.supabase
      .from('lessons')
      .select(
        `
        *,
        modules!inner (
          id,
          title,
          course_id
        )
      `
      )
      .eq('id', input.lessonId)
      .single()

    if (error) {
      throw new TRPCError({ code: 'NOT_FOUND', message: error.message })
    }

    // Get user's progress for this lesson
    const { data: progress } = await ctx.supabase
      .from('user_lesson_progress')
      .select('is_complete, last_position_sec')
      .eq('user_id', ctx.user.id)
      .eq('lesson_id', input.lessonId)
      .single()

    return {
      id: lesson.id,
      moduleId: lesson.module_id,
      title: lesson.title,
      description: lesson.description,
      type: lesson.lesson_type as 'video' | 'audio' | 'pdf' | 'text',
      durationSec: lesson.duration_sec,
      contentUrl: lesson.content_url,
      contentText: lesson.content_text,
      module: {
        id: lesson.modules.id,
        title: lesson.modules.title,
        courseId: lesson.modules.course_id,
      },
      isComplete: progress?.is_complete || false,
      lastPositionSec: progress?.last_position_sec || 0,
    }
  }),

  // Get next lesson in sequence
  getNextLesson: protectedProcedure
    .input(z.object({ currentLessonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      if (USE_MOCK_DATA) {
        // Find current lesson and its position
        for (const [courseId, modules] of Object.entries(MOCK_MODULES)) {
          for (let moduleIdx = 0; moduleIdx < modules.length; moduleIdx++) {
            const module = modules[moduleIdx]
            const lessonIdx = module.lessons.findIndex((l) => l.id === input.currentLessonId)

            if (lessonIdx !== -1) {
              // Found current lesson, now find next
              // First try next lesson in same module
              if (lessonIdx < module.lessons.length - 1) {
                const nextLesson = module.lessons[lessonIdx + 1]
                return {
                  id: nextLesson.id,
                  moduleId: module.id,
                  title: nextLesson.title,
                  type: nextLesson.type,
                }
              }

              // Try first lesson of next module
              if (moduleIdx < modules.length - 1) {
                const nextModule = modules[moduleIdx + 1]
                if (nextModule.lessons.length > 0) {
                  const firstLesson = nextModule.lessons[0]
                  return {
                    id: firstLesson.id,
                    moduleId: nextModule.id,
                    title: firstLesson.title,
                    type: firstLesson.type,
                  }
                }
              }

              // No more lessons
              return null
            }
          }
        }
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Current lesson not found' })
      }

      // First, get current lesson to find its module and order
      const { data: currentLesson, error: currentError } = await ctx.supabase
        .from('lessons')
        .select(
          `
        module_id,
        order_index,
        modules!inner (
          course_id,
          order_index
        )
      `
        )
        .eq('id', input.currentLessonId)
        .single()

      if (currentError) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Current lesson not found' })
      }

      // Try to find next lesson in same module
      const { data: nextInModule } = await ctx.supabase
        .from('lessons')
        .select('*')
        .eq('module_id', currentLesson.module_id)
        .gt('order_index', currentLesson.order_index)
        .order('order_index', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (nextInModule) {
        return {
          id: nextInModule.id,
          moduleId: nextInModule.module_id,
          title: nextInModule.title,
          type: nextInModule.lesson_type as 'video' | 'audio' | 'pdf' | 'text',
        }
      }

      // If no next lesson in module, find first lesson of next module
      const { data: nextModule } = await ctx.supabase
        .from('modules')
        .select('id')
        .eq('course_id', currentLesson.modules.course_id)
        .gt('order_index', currentLesson.modules.order_index)
        .order('order_index', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (!nextModule) {
        // No more lessons in the course
        return null
      }

      // Get first lesson of next module
      const { data: firstLessonNextModule } = await ctx.supabase
        .from('lessons')
        .select('*')
        .eq('module_id', nextModule.id)
        .order('order_index', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (!firstLessonNextModule) {
        return null
      }

      return {
        id: firstLessonNextModule.id,
        moduleId: firstLessonNextModule.module_id,
        title: firstLessonNextModule.title,
        type: firstLessonNextModule.lesson_type as 'video' | 'audio' | 'pdf' | 'text',
      }
    }),

  // Get previous lesson in sequence
  getPreviousLesson: protectedProcedure
    .input(z.object({ currentLessonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Get current lesson to find its module and order
      const { data: currentLesson, error: currentError } = await ctx.supabase
        .from('lessons')
        .select(
          `
        module_id,
        order_index,
        modules!inner (
          course_id,
          order_index
        )
      `
        )
        .eq('id', input.currentLessonId)
        .single()

      if (currentError) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Current lesson not found' })
      }

      // Try to find previous lesson in same module
      const { data: previousInModule } = await ctx.supabase
        .from('lessons')
        .select('*')
        .eq('module_id', currentLesson.module_id)
        .lt('order_index', currentLesson.order_index)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (previousInModule) {
        return {
          id: previousInModule.id,
          moduleId: previousInModule.module_id,
          title: previousInModule.title,
          type: previousInModule.lesson_type as 'video' | 'audio' | 'pdf' | 'text',
        }
      }

      // If no previous lesson in module, find last lesson of previous module
      const { data: previousModule } = await ctx.supabase
        .from('modules')
        .select('id')
        .eq('course_id', currentLesson.modules.course_id)
        .lt('order_index', currentLesson.modules.order_index)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!previousModule) {
        // No previous lessons
        return null
      }

      // Get last lesson of previous module
      const { data: lastLessonPreviousModule } = await ctx.supabase
        .from('lessons')
        .select('*')
        .eq('module_id', previousModule.id)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!lastLessonPreviousModule) {
        return null
      }

      return {
        id: lastLessonPreviousModule.id,
        moduleId: lastLessonPreviousModule.module_id,
        title: lastLessonPreviousModule.title,
        type: lastLessonPreviousModule.lesson_type as 'video' | 'audio' | 'pdf' | 'text',
      }
    }),
})
